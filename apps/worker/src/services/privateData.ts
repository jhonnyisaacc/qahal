import type { Bindings } from '../types/env';
import { database } from '../lib/db';
import { decrypt, encrypt, usernameIndex } from './encryption';

export interface PrivateProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  birthDate?: string | null;
  answers?: Record<string, string>;
}
export async function readPrivate<T>(env: Bindings, context: string): Promise<T | null> {
  const row = await database(env.DB)
    .prepare('SELECT ciphertext FROM private_data WHERE context = ?')
    .bind(context)
    .first<{ ciphertext: string }>();
  return row ? decrypt<T>(env, context, row.ciphertext) : null;
}
export async function privateStatement(env: Bindings, context: string, value: unknown) {
  return database(env.DB)
    .prepare(
      'INSERT INTO private_data(context, ciphertext) VALUES (?, ?) ON CONFLICT(context) DO UPDATE SET ciphertext = excluded.ciphertext, updated_at = CURRENT_TIMESTAMP',
    )
    .bind(context, await encrypt(env, context, value));
}
export async function readProfile(env: Bindings, id: number): Promise<PrivateProfile> {
  const value = await readPrivate<PrivateProfile>(env, `user:${id}:profile`);
  if (value) return value;
  const legacy = await database(env.DB)
    .prepare(
      'SELECT first_name AS firstName, last_name AS lastName, username, birth_date AS birthDate FROM users WHERE telegram_id = ?',
    )
    .bind(id)
    .first<PrivateProfile>();
  if (legacy && Object.values(legacy).some(Boolean)) {
    if (env.ALLOW_LEGACY_PLAINTEXT !== 'true') throw new Error('private_data_migration_required');
    const answers = await database(env.DB)
      .prepare(
        'SELECT question_key, answer_value FROM user_onboarding_answers WHERE telegram_id = ?',
      )
      .bind(id)
      .all<{ question_key: string; answer_value: string }>();
    return {
      ...legacy,
      answers: Object.fromEntries(answers.results.map((a) => [a.question_key, a.answer_value])),
    };
  }
  return {};
}
export async function profileStatements(env: Bindings, id: number, value: PrivateProfile) {
  return [
    await privateStatement(env, `user:${id}:profile`, value),
    database(env.DB)
      .prepare(
        'UPDATE users SET first_name = NULL, last_name = NULL, username = NULL, birth_date = NULL, photo_url = NULL, username_index = ? WHERE telegram_id = ?',
      )
      .bind(value.username ? await usernameIndex(env, value.username) : null, id),
    database(env.DB).prepare('DELETE FROM user_onboarding_answers WHERE telegram_id = ?').bind(id),
  ];
}
export const coarse = (coordinate: number) => Math.round(coordinate * 20) / 20;

// Optimistic concurrency prevents independent profile edits from replacing each other.
export async function patchProfile(env: Bindings, id: number, patch: Partial<PrivateProfile>) {
  const db = database(env.DB);
  const context = `user:${id}:profile`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const before = await db
      .prepare('SELECT ciphertext FROM private_data WHERE context = ?')
      .bind(context)
      .first<{ ciphertext: string }>();
    const current = before
      ? await decrypt<PrivateProfile>(env, context, before.ciphertext)
      : await readProfile(env, id);
    const next = { ...current, ...patch };
    const ciphertext = await encrypt(env, context, next);
    const result = await db.batch([
      db
        .prepare(
          `INSERT INTO private_data(context, ciphertext) VALUES (?, ?)
        ON CONFLICT(context) DO UPDATE SET ciphertext = excluded.ciphertext, updated_at = CURRENT_TIMESTAMP
        WHERE private_data.ciphertext = ? RETURNING context`,
        )
        .bind(context, ciphertext, before?.ciphertext ?? null),
      db
        .prepare(
          `UPDATE users SET username_index = ? WHERE telegram_id = ? AND EXISTS(
        SELECT 1 FROM private_data WHERE context = ? AND ciphertext = ?)`,
        )
        .bind(
          next.username ? await usernameIndex(env, next.username) : null,
          id,
          context,
          ciphertext,
        ),
    ]);
    if (result[0]?.results.length) return next;
  }
  throw new Error('profile_update_conflict');
}
