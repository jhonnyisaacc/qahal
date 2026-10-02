import { beforeAll, describe, expect, it } from 'vitest';
import { env, applyD1Migrations, type D1Migration } from 'cloudflare:test';
import type { D1Database } from '@cloudflare/workers-types';
import app from '../index';
import { redeem, hashCode } from './access';
import { encrypt, decrypt, usernameIndex } from './encryption';
import { profileStatements, coarse } from './privateData';
import { createSignedInitData, TEST_BOT_TOKEN } from '../test/telegramInitData';
import type { Bindings } from '../types/env';

const testEnv = env as unknown as { DB: D1Database; TEST_MIGRATIONS: D1Migration[] };
const db = testEnv.DB;
const keys = { first: btoa('a'.repeat(32)), second: btoa('b'.repeat(32)) };
const bindings: Bindings = {
  DB: db,
  APP_ENV: 'production',
  INVITE_GATE_ENABLED: 'true',
  TELEGRAM_BOT_TOKEN: TEST_BOT_TOKEN,
  DATA_KEYS: JSON.stringify(keys),
  DATA_KEY_ID: 'first',
  LOOKUP_KEY: btoa('c'.repeat(32)),
};
async function request(
  path: string,
  id?: number,
  payload?: unknown,
  overrides: Partial<Bindings> = {},
  method?: string,
) {
  return app.request(
    `https://qahal.test${path}`,
    {
      method: method ?? (payload ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(id
          ? {
              'X-Telegram-Init-Data': await createSignedInitData({
                authDate: Math.floor(Date.now() / 1000),
                user: { id, username: `person${id}` },
              }),
            }
          : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
    },
    { ...bindings, ...overrides },
  );
}
beforeAll(async () => {
  await applyD1Migrations(db, testEnv.TEST_MIGRATIONS);
  await db
    .prepare(
      "INSERT INTO users(telegram_id, emunah_state, emunah_level_approved) VALUES (999001, 'leader', 1)",
    )
    .run();
});
describe('encryption', () => {
  it('binds ciphertext to context, uses random nonces and supports old keys during rotation', async () => {
    const first = await encrypt(bindings, 'user:1:profile', { name: 'Sensitive' });
    expect(first).not.toContain('Sensitive');
    expect(await encrypt(bindings, 'user:1:profile', { name: 'Sensitive' })).not.toBe(first);
    await expect(decrypt(bindings, 'user:2:profile', first)).rejects.toThrow();
    await expect(
      decrypt({ ...bindings, DATA_KEY_ID: 'second' }, 'user:1:profile', first),
    ).resolves.toEqual({ name: 'Sensitive' });
    await expect(
      decrypt({ ...bindings, DATA_KEYS: '{}' }, 'user:1:profile', first),
    ).rejects.toThrow();
    const tampered = JSON.parse(first);
    tampered.data = btoa('tampered');
    await expect(decrypt(bindings, 'user:1:profile', JSON.stringify(tampered))).rejects.toThrow();
    expect(await usernameIndex(bindings, '@Miriam')).toBe(await usernameIndex(bindings, 'miriam'));
  });
});
describe('admission', () => {
  it('denies anonymous and non-admitted domain calls on every URL alias', async () => {
    for (const path of [
      '/users/999002',
      '/api/users/999002',
      '/discovery?type=online',
      '/api/discovery?type=online',
      '/api/cities/search?q=Paris',
      '/communities/people',
    ]) {
      expect((await request(path)).status).toBe(401);
      expect((await request(path, 999002)).status).toBe(403);
    }
    expect(
      (
        await request('/discovery?type=online', undefined, undefined, {
          INVITE_GATE_ENABLED: 'false',
        })
      ).status,
    ).toBe(401);
    expect(
      (await request('/users/999003', 999002, undefined, { INVITE_GATE_ENABLED: 'false' })).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'https://preview.qahal.test/users/1',
          {},
          { ...bindings, APP_ENV: 'development', INVITE_GATE_ENABLED: 'false' },
        )
      ).status,
    ).toBe(401);
  });
  it('enforces capacity atomically, retries idempotently, and retains admission after revocation', async () => {
    const code = 'A'.repeat(32);
    await db
      .prepare(
        'INSERT INTO access_codes(id, code_hash, leader_telegram_id, expires_at, max_uses) VALUES (?, ?, 999001, ?, 1)',
      )
      .bind('single', await hashCode(code), Math.floor(Date.now() / 1000) + 3600)
      .run();
    const results = await Promise.all([
      redeem(bindings, 999010, code, 'one'),
      redeem(bindings, 999011, code, 'two'),
    ]);
    expect(results.sort()).toEqual(['admitted', 'invalid_code']);
    const admitted = await db
      .prepare("SELECT telegram_id AS id FROM admissions WHERE code_id = 'single'")
      .first<{ id: number }>();
    await db.prepare("UPDATE access_codes SET revoked = 1 WHERE id = 'single'").run();
    expect(await redeem(bindings, admitted!.id, code, 'three')).toBe('admitted');
    expect(await redeem(bindings, 999012, code, 'four')).toBe('invalid_code');
    expect((await request('/access/status', admitted!.id)).status).toBe(200);
  });
  it('rejects expired codes and throttles repeated invalid redemption', async () => {
    const code = 'B'.repeat(32);
    await db
      .prepare(
        'INSERT INTO access_codes(id, code_hash, leader_telegram_id, expires_at) VALUES (?, ?, 999001, 1)',
      )
      .bind('expired', await hashCode(code))
      .run();
    for (let i = 0; i < 10; i++)
      expect(await redeem(bindings, 999020, code, 'throttle')).toBe('invalid_code');
    expect(await redeem(bindings, 999020, code, 'throttle')).toBe('rate_limited');
  });
});
describe('discovery and private writes', () => {
  it('distinguishes online and local, falls back only to consented people without leaking coordinates', async () => {
    const open = { INVITE_GATE_ENABLED: 'false' };
    for (const id of [999030, 999031, 999032]) {
      await db
        .prepare(
          'INSERT INTO users(telegram_id, city, onboarding_completed, discoverable, contact_visible) VALUES (?, ?, 1, ?, 1)',
        )
        .bind(id, 'Test area', id === 999032 ? 0 : 1)
        .run();
      await db.batch(
        await profileStatements(bindings, id, {
          firstName: `Person ${id}`,
          username: `person${id}`,
        }),
      );
      await db
        .prepare(
          "INSERT INTO user_badges(telegram_id,badge_key,badge_label) VALUES (?, 'emunah', 'Emunah')",
        )
        .bind(id)
        .run();
      await db
        .prepare(
          'INSERT INTO user_locations(telegram_id,latitude,longitude,city) VALUES (?, 0, 0, ?)',
        )
        .bind(id, 'Test area')
        .run();
    }
    const fallback = (await (
      await request('/discovery?latitude=0&longitude=0', 999030, undefined, open)
    ).json()) as any;
    expect(fallback.people.map((p: any) => p.id)).toEqual([999031]);
    expect(fallback.people[0]).not.toHaveProperty('latitude');
    expect(fallback.people[0]).not.toHaveProperty('answers');
    await db
      .prepare("INSERT INTO communities(id,name,type) VALUES (999001,'Online test','online')")
      .run();
    const online = (await (
      await request('/discovery?type=online', 999030, undefined, open)
    ).json()) as any;
    expect(online.communities[0].distanceKm).toBeNull();
    expect(
      (
        (await (
          await request('/discovery?latitude=0&longitude=0', 999030, undefined, open)
        ).json()) as any
      ).people,
    ).toHaveLength(1);
    await db
      .prepare(
        "INSERT INTO communities(id,name,city,country,latitude,longitude) VALUES (999002,'Local test','Test','Test',0,0)",
      )
      .run();
    const local = (await (
      await request('/discovery?latitude=0&longitude=0', 999030, undefined, open)
    ).json()) as any;
    expect(local.communities.map((c: any) => c.id)).toEqual([999002]);
    expect(local.people).toEqual([]);
    expect(
      (await request('/communities/999001/meeting?telegramId=999030', 999030, undefined, open))
        .status,
    ).toBe(403);
  });
  it('stores only a coarse current location and rejects profile picture writes', async () => {
    for (const latitude of [1.23456, 2.34567])
      expect(
        (
          await request(
            '/locations',
            999030,
            { telegramId: 999030, latitude, longitude: 3.45678 },
            { INVITE_GATE_ENABLED: 'false' },
          )
        ).status,
      ).toBe(200);
    const rows = await db
      .prepare('SELECT latitude,longitude FROM user_locations WHERE telegram_id = 999030')
      .all();
    expect(rows.results).toEqual([{ latitude: coarse(2.34567), longitude: coarse(3.45678) }]);
    await expect(
      db
        .prepare("UPDATE users SET photo_url = 'https://photo.test' WHERE telegram_id = 999030")
        .run(),
    ).rejects.toThrow();
    const row = await db
      .prepare('SELECT first_name,username FROM users WHERE telegram_id = 999030')
      .first();
    expect(row).toEqual({ first_name: null, username: null });
  });
});

describe('migration and recovery', () => {
  it('resumes after interruption, removes plaintext, and preserves values through rotation', async () => {
    const { privateMigration } = await import('./privateMigration');
    const query = async <T = Record<string, unknown>>(
      sql: string,
      params: unknown[] = [],
    ): Promise<T[]> =>
      (
        await db
          .prepare(sql)
          .bind(...params)
          .all<T>()
      ).results;
    await db
      .prepare(
        "INSERT INTO users(telegram_id,first_name,username) VALUES (999070,'Legacy Name','legacy_user')",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO user_onboarding_answers(telegram_id,question_key,answer_value) VALUES (999070,'1','yes')",
      )
      .run();
    const interrupted: typeof query = async (sql, params = []) => {
      if (sql.startsWith('UPDATE users SET username_index') && params.at(-1) === 999070)
        throw new Error('simulated interruption');
      return query(sql, params);
    };
    await expect(privateMigration(bindings, interrupted).backfill()).rejects.toThrow(
      'simulated interruption',
    );
    await privateMigration(bindings, query).backfill();
    await privateMigration(bindings, query).verify();
    const rotated = { ...bindings, DATA_KEY_ID: 'second' };
    await privateMigration(rotated, query).verify(true);
    const { readProfile } = await import('./privateData');
    expect(await readProfile(rotated, 999070)).toMatchObject({
      firstName: 'Legacy Name',
      username: 'legacy_user',
      answers: { '1': 'yes' },
    });
    await expect(
      readProfile({ ...rotated, DATA_KEYS: JSON.stringify({ first: keys.first }) }, 999070),
    ).rejects.toThrow();
    const row = await db
      .prepare('SELECT first_name,username FROM users WHERE telegram_id = 999070')
      .first();
    expect(row).toEqual({ first_name: null, username: null });
  });
});
