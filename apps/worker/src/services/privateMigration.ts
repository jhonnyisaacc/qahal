import type { Bindings } from '../types/env';
import { encrypt, decrypt, usernameIndex } from './encryption';
export type PrivateQuery = <T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
) => Promise<T[]>;
export function privateMigration(env: Bindings, query: PrivateQuery) {
  async function save(context: string, value: unknown) {
    const ciphertext = await encrypt(env, context, value);
    await query(
      'INSERT INTO private_data(context, ciphertext) VALUES (?, ?) ON CONFLICT(context) DO NOTHING',
      [context, ciphertext],
    );
    const [stored] = await query<{ ciphertext: string }>(
      'SELECT ciphertext FROM private_data WHERE context = ?',
      [context],
    );
    if (!stored) throw new Error('Backfill verification failed');
    return decrypt<Record<string, unknown>>(env, context, stored.ciphertext);
  }

  async function backfill() {
    // Run during maintenance with writes paused. Restarting is safe after any completed statement.
    let after = 0;
    while (true) {
      const users = await query<{
        telegram_id: number;
        first_name: string | null;
        last_name: string | null;
        username: string | null;
        birth_date: string | null;
      }>(
        'SELECT telegram_id, first_name, last_name, username, birth_date FROM users WHERE telegram_id > ? ORDER BY telegram_id LIMIT 100',
        [after],
      );
      if (!users.length) break;
      for (const user of users) {
        const answers = await query<{ question_key: string; answer_value: string }>(
          'SELECT question_key, answer_value FROM user_onboarding_answers WHERE telegram_id = ?',
          [user.telegram_id],
        );
        const profile = await save(`user:${user.telegram_id}:profile`, {
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          birthDate: user.birth_date,
          answers: Object.fromEntries(answers.map((a) => [a.question_key, a.answer_value])),
        });
        for (const [legacyKey, privateKey] of [
          ['first_name', 'firstName'],
          ['last_name', 'lastName'],
          ['username', 'username'],
          ['birth_date', 'birthDate'],
        ] as const) {
          if (user[legacyKey] !== null && user[legacyKey] !== profile[privateKey])
            throw new Error('Legacy/private conflict; review before clearing plaintext');
        }
        for (const answer of answers) {
          if (
            (profile.answers as Record<string, string> | undefined)?.[answer.question_key] !==
            answer.answer_value
          )
            throw new Error('Legacy/private answer conflict');
        }
        await query(
          'UPDATE users SET username_index = ?, first_name = NULL, last_name = NULL, username = NULL, birth_date = NULL, photo_url = NULL WHERE telegram_id = ?',
          [
            profile.username ? await usernameIndex(env, String(profile.username)) : null,
            user.telegram_id,
          ],
        );
        await query('DELETE FROM user_onboarding_answers WHERE telegram_id = ?', [
          user.telegram_id,
        ]);
        after = user.telegram_id;
      }
    }
    let communityAfter = 0;
    while (true) {
      const communities = await query<{ id: number }>(
        'SELECT id FROM communities WHERE id > ? ORDER BY id LIMIT 100',
        [communityAfter],
      );
      if (!communities.length) break;
      for (const community of communities) {
        const slots = await query(
          'SELECT id, weekday, time_minutes AS timeMinutes FROM community_meeting_slots WHERE community_id = ?',
          [community.id],
        );
        const stored = await save(`community:${community.id}:meetings`, { slots });
        if (slots.length && JSON.stringify(stored.slots) !== JSON.stringify(slots))
          throw new Error('Legacy/private meeting conflict');
        await query('DELETE FROM community_meeting_slots WHERE community_id = ?', [community.id]);
        communityAfter = community.id;
      }
    }
  }
  async function verify(rotate = false) {
    let after = '';
    while (true) {
      const rows = await query<{ context: string; ciphertext: string }>(
        'SELECT context, ciphertext FROM private_data WHERE context > ? ORDER BY context LIMIT 100',
        [after],
      );
      if (!rows.length) break;
      for (const row of rows) {
        const value = await decrypt(env, row.context, row.ciphertext);
        if (!rotate && JSON.parse(row.ciphertext).kid !== env.DATA_KEY_ID)
          throw new Error('Old key version remains; finish rotation before retiring keys');
        if (rotate)
          await query(
            'UPDATE private_data SET ciphertext = ? WHERE context = ? AND ciphertext = ?',
            [await encrypt(env, row.context, value), row.context, row.ciphertext],
          );
        after = row.context;
      }
    }
    const [remaining] = await query<{ count: number }>(`SELECT
    (SELECT COUNT(*) FROM users WHERE first_name IS NOT NULL OR last_name IS NOT NULL OR username IS NOT NULL OR birth_date IS NOT NULL OR photo_url IS NOT NULL)
    + (SELECT COUNT(*) FROM user_onboarding_answers) + (SELECT COUNT(*) FROM community_meeting_slots) AS count`);
    if (remaining?.count) throw new Error('Plaintext remains; backfill before cutover');
  }
  return { backfill, verify };
}
