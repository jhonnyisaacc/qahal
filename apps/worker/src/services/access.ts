import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../types/env';
import { verifyTelegramInitData } from './telegramAuth';
import { database } from '../lib/db';
import { isProductionRequest } from '../lib/runtimeEnv';

export async function hashCode(code: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code.trim().replace(/-/g, '').toUpperCase()),
  );
  return Array.from(new Uint8Array(hash), (v) => v.toString(16).padStart(2, '0')).join('');
}
export const gateEnabled = (env: Bindings) => env.INVITE_GATE_ENABLED !== 'false';
export async function isAdmitted(env: Bindings, telegramId: number) {
  return (
    !gateEnabled(env) ||
    Boolean(
      await database(env.DB)
        .prepare('SELECT 1 FROM admissions WHERE telegram_id = ?')
        .bind(telegramId)
        .first(),
    )
  );
}
export async function authenticate(headers: Headers, env: Bindings): Promise<number | null> {
  const initData =
    headers.get('x-telegram-init-data') ||
    headers.get('authorization')?.replace(/^tma\s+/i, '') ||
    '';
  const age = Number(env.INITDATA_MAX_AGE_SECONDS ?? 300);
  const result = await verifyTelegramInitData({
    initData,
    botToken: env.TELEGRAM_BOT_TOKEN,
    maxAgeSeconds: Number.isFinite(age) && age > 0 ? age : 300,
  });
  return result.valid && result.user ? result.user.id : null;
}
export const protectDomain: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  c.header('Cache-Control', 'no-store');
  const path = c.req.path.replace(/^\/api(?=\/)/, '').replace(/\/$/, '') || '/';
  if (
    c.req.method === 'OPTIONS' ||
    path === '/' ||
    path === '/health' ||
    path === '/auth/telegram/verify'
  )
    return next();
  // Explicit local/test mode only; hosted preview environments are protected too.
  if (!isProductionRequest(c) && c.env.INVITE_GATE_ENABLED === 'false') return next();
  const telegramId = await authenticate(c.req.raw.headers, c.env);
  if (!telegramId) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  if (
    path !== '/access/status' &&
    path !== '/access/redeem' &&
    !(await isAdmitted(c.env, telegramId))
  ) {
    return c.json({ ok: false, error: 'admission_required' }, 403);
  }
  c.header('Cache-Control', 'no-store');
  return next();
};

export async function redeem(env: Bindings, telegramId: number, code: string, ip: string) {
  const db = database(env.DB);
  if (await isAdmitted(env, telegramId)) return 'admitted';
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / 900);
  const buckets = [`account:${telegramId}:${window}`, `ip:${await hashCode(ip)}:${window}`];
  const counts = await db.batch(
    buckets.map((bucket) =>
      db
        .prepare(
          'INSERT INTO access_attempts(bucket, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts',
        )
        .bind(bucket, (window + 1) * 900),
    ),
  );
  await db.prepare('DELETE FROM access_attempts WHERE expires_at < ?').bind(now).run();
  if (
    Number((counts[0]!.results[0] as { attempts: number }).attempts) > 10 ||
    Number((counts[1]!.results[0] as { attempts: number }).attempts) > 100
  )
    return 'rate_limited';
  // One SQLite statement serializes capacity checks and insertion across concurrent callers.
  await db
    .prepare(
      `INSERT INTO admissions(telegram_id, code_id)
    SELECT ?, id FROM access_codes c WHERE code_hash = ? AND revoked = 0 AND expires_at > ?
    AND (SELECT COUNT(*) FROM admissions a WHERE a.code_id = c.id) < max_uses
    ON CONFLICT(telegram_id) DO NOTHING`,
    )
    .bind(telegramId, await hashCode(code), now)
    .run();
  return (await isAdmitted(env, telegramId)) ? 'admitted' : 'invalid_code';
}
