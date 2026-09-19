import { Hono } from 'hono';
import { redeemCodeSchema } from '@qahal/shared';
import type { Bindings } from '../types/env';
import { authenticate, gateEnabled, isAdmitted, redeem } from '../services/access';

export const accessRoute = new Hono<{ Bindings: Bindings }>();
accessRoute.get('/status', async (c) => {
  const telegramId = await authenticate(c.req.raw.headers, c.env);
  if (!telegramId) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  return c.json({
    ok: true,
    telegramId,
    gateEnabled: gateEnabled(c.env),
    admitted: await isAdmitted(c.env, telegramId),
  });
});
accessRoute.post('/redeem', async (c) => {
  const telegramId = await authenticate(c.req.raw.headers, c.env);
  if (!telegramId) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  const parsed = redeemCodeSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ ok: false, error: 'invalid_code' }, 400);
  const result = await redeem(
    c.env,
    telegramId,
    parsed.data.code,
    c.req.header('CF-Connecting-IP') ?? 'local',
  );
  if (result !== 'admitted')
    return c.json({ ok: false, error: result }, result === 'rate_limited' ? 429 : 400);
  return c.json({ ok: true, admitted: true });
});
