import { Hono } from 'hono';
import { locationUpsertSchema } from '@qahal/shared';
import type { Bindings } from '../types/env';
import { requireTelegramIdentity } from '../lib/telegramIdentity';
import { database } from '../lib/db';
import { coarse } from '../services/privateData';
export const locationsRoute = new Hono<{ Bindings: Bindings }>();
locationsRoute.post('/', async (c) => {
  const parsed = locationUpsertSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ ok: false, error: 'invalid_payload' }, 400);
  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const db = database(c.env.DB);
  const area = parsed.data as { city?: string; state?: string; country?: string };
  await db.batch([
    db
      .prepare('INSERT INTO users(telegram_id) VALUES (?) ON CONFLICT DO NOTHING')
      .bind(identity.telegramId),
    db
      .prepare(
        `INSERT INTO user_locations(telegram_id, latitude, longitude, city, state, country)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(telegram_id) DO UPDATE SET latitude = excluded.latitude,
      longitude = excluded.longitude, city = COALESCE(excluded.city, user_locations.city), state = excluded.state,
      country = excluded.country, accuracy = NULL, created_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        identity.telegramId,
        coarse(parsed.data.latitude),
        coarse(parsed.data.longitude),
        area.city ?? null,
        area.state ?? null,
        area.country ?? null,
      ),
  ]);
  return c.json({ ok: true });
});
