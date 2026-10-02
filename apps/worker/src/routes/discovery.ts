import { Hono } from 'hono';
import { discoveryQuerySchema, discoveryPreferencesSchema } from '@qahal/shared';
import type { Bindings } from '../types/env';
import { database } from '../lib/db';
import { authenticate } from '../services/access';
import { coarse, readProfile } from '../services/privateData';

export function distanceKm(lat: number, lon: number, toLat: number, toLon: number) {
  const r = Math.PI / 180;
  const a =
    Math.sin(((toLat - lat) * r) / 2) ** 2 +
    Math.cos(lat * r) * Math.cos(toLat * r) * Math.sin(((toLon - lon) * r) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}
export const discoveryRoute = new Hono<{ Bindings: Bindings }>();
discoveryRoute.get('/', async (c) => {
  const query = discoveryQuerySchema.safeParse(c.req.query());
  if (!query.success) return c.json({ ok: false, error: 'invalid_query' }, 400);
  const id = await authenticate(c.req.raw.headers, c.env);
  if (!id) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  const { type, radiusKm, page } = query.data;
  const latitude = coarse(query.data.latitude ?? 0),
    longitude = coarse(query.data.longitude ?? 0);
  const db = database(c.env.DB);
  type Row = {
    id: number;
    name: string;
    city: string | null;
    type: 'in_person' | 'online';
    latitude: number;
    longitude: number;
    memberState: 'not_member' | 'requested' | 'member';
    owner: number;
  };
  const rows = await db
    .prepare(
      `SELECT c.id, c.name, c.city, c.type, c.latitude, c.longitude, c.owner_telegram_id as owner,
    COALESCE(m.status, 'not_member') as memberState FROM communities c LEFT JOIN user_community_memberships m
    ON m.community_id = c.id AND m.telegram_id = ? WHERE c.type = ? AND (? = 'online' OR c.latitude BETWEEN (?4 - ?5) AND (?4 + ?5))
    ORDER BY c.name, c.id`,
    )
    .bind(id, type, type, latitude, radiusKm / 110)
    .all<Row>();
  const communities = rows.results
    .map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      type: row.type,
      distanceKm:
        type === 'online' ? null : distanceKm(latitude, longitude, row.latitude, row.longitude),
      memberState: row.memberState,
      canManage: row.owner === id,
    }))
    .filter((row) => row.distanceKm === null || row.distanceKm <= radiusKm);
  if (type === 'in_person')
    communities.sort((a, b) => a.distanceKm! - b.distanceKm! || a.id - b.id);
  const size = 20;
  if (communities.length || type === 'online')
    return c.json({
      ok: true,
      communities: communities.slice(page * size, (page + 1) * size).map((row) => ({
        ...row,
        distanceKm: row.distanceKm === null ? null : Math.round(row.distanceKm),
      })),
      people: [],
      nextPage: communities.length > (page + 1) * size ? page + 1 : null,
    });
  const candidates = await db
    .prepare(
      `SELECT u.telegram_id as id, COALESCE(l.city, u.city, '') as area,
    u.contact_visible as contactVisible, l.latitude, l.longitude FROM users u JOIN user_locations l ON l.telegram_id = u.telegram_id
    WHERE u.discoverable = 1 AND u.onboarding_completed = 1 AND u.telegram_id != ?
    AND EXISTS(SELECT 1 FROM user_badges b WHERE b.telegram_id = u.telegram_id AND b.badge_key = 'emunah')
    AND l.latitude BETWEEN (?2 - ?3) AND (?2 + ?3)`,
    )
    .bind(id, latitude, radiusKm / 110)
    .all<{
      id: number;
      area: string;
      contactVisible: number;
      latitude: number;
      longitude: number;
    }>();
  const peopleInRange = candidates.results
    .map((row) => ({
      ...row,
      distance: distanceKm(latitude, longitude, row.latitude, row.longitude),
    }))
    .filter((row) => row.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance || a.id - b.id);
  const people = await Promise.all(
    peopleInRange.slice(page * size, (page + 1) * size).map(async (row) => {
      const profile = await readProfile(c.env, row.id);
      return {
        id: row.id,
        name: profile.firstName || 'Emunah',
        area: row.area,
        contactUrl:
          row.contactVisible && profile.username && /^[a-zA-Z0-9_]+$/.test(profile.username)
            ? `https://t.me/${profile.username}`
            : null,
      };
    }),
  );
  return c.json({
    ok: true,
    communities: [],
    people,
    nextPage: peopleInRange.length > (page + 1) * size ? page + 1 : null,
  });
});
discoveryRoute.get('/preferences', async (c) => {
  const id = await authenticate(c.req.raw.headers, c.env);
  if (!id) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  const row = await database(c.env.DB)
    .prepare(
      'SELECT discoverable, contact_visible AS contactVisible FROM users WHERE telegram_id = ?',
    )
    .bind(id)
    .first<{ discoverable: number; contactVisible: number }>();
  return c.json({
    discoverable: Boolean(row?.discoverable),
    contactVisible: Boolean(row?.contactVisible),
  });
});
discoveryRoute.put('/preferences', async (c) => {
  const id = await authenticate(c.req.raw.headers, c.env);
  if (!id) return c.json({ ok: false, error: 'telegram_auth_required' }, 401);
  const parsed = discoveryPreferencesSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ ok: false, error: 'invalid_payload' }, 400);
  await database(c.env.DB)
    .prepare('UPDATE users SET discoverable = ?, contact_visible = ? WHERE telegram_id = ?')
    .bind(Number(parsed.data.discoverable), Number(parsed.data.contactVisible), id)
    .run();
  return c.json({ ok: true });
});
