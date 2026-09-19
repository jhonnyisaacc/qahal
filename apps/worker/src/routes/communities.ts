import { database } from '../lib/db';
import { coarse, readProfile, readPrivate, privateStatement } from '../services/privateData';
import { usernameIndex } from '../services/encryption';
import { Hono } from 'hono';
import {
  membershipRequestSchema,
  meetingLinkSchema,
  addCommunityMemberByUsernameSchema,
  createCommunitySchema,
  meetingSlotsUpsertSchema,
  nearbyQuerySchema,
  renameCommunitySchema,
} from '@qahal/shared';
import type { Bindings } from '../types/env';
import {
  getNearestSeedLocation,
  getSeedLeadersByCity,
  getSeedLocationByCity,
} from '../services/seedData';
import { requireTelegramIdentity, resolveOptionalTelegramIdentity } from '../lib/telegramIdentity';

export const communitiesRoute = new Hono<{ Bindings: Bindings }>();

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
};

const hasD1 = (db: unknown): db is D1Like => {
  return typeof db === 'object' && db !== null && 'prepare' in db;
};

const normalizeApprovalFlag = (value: unknown): boolean => {
  return value === true || value === 1 || value === '1';
};

const distanceKm = (fromLat: number, fromLng: number, toLat: number, toLng: number): number => {
  const toRadians = (value: number): number => value * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

type UserCommunityCapabilities = {
  canCreateQahal: boolean;
  managedCommunityId: number | null;
};

const resolveUserCommunityCapabilities = async (
  db: D1Like,
  telegramId: number,
): Promise<UserCommunityCapabilities> => {
  type CountRow = { count: number };
  type ManagedRow = { communityId: number };

  const [memberRows, managedCommunity] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) as count
         FROM user_community_memberships
         WHERE telegram_id = ?1
           AND status = 'member'`,
      )
      .bind(telegramId)
      .first<CountRow>(),
    db
      .prepare(
        `SELECT id as communityId
         FROM communities
         WHERE owner_telegram_id = ?1
         ORDER BY id ASC
         LIMIT 1`,
      )
      .bind(telegramId)
      .first<ManagedRow>(),
  ]);
  let leaderApprovalPending = false;

  try {
    type ApprovalRow = {
      emunahState: string | null;
      emunahLevelApproved: number | boolean | null;
    };

    const approvalState = await db
      .prepare(
        `SELECT emunah_state as emunahState,
                emunah_level_approved as emunahLevelApproved
         FROM users
         WHERE telegram_id = ?1
         LIMIT 1`,
      )
      .bind(telegramId)
      .first<ApprovalRow>();

    leaderApprovalPending =
      approvalState?.emunahState === 'leader' &&
      !normalizeApprovalFlag(approvalState.emunahLevelApproved);
  } catch {
    leaderApprovalPending = true;
  }

  const hasMemberCommunity = Number(memberRows?.count ?? 0) > 0;

  return {
    canCreateQahal: !hasMemberCommunity && !managedCommunity && !leaderApprovalPending,
    managedCommunityId: managedCommunity?.communityId ?? null,
  };
};

const getManagedCommunityIdByOwner = async (
  db: D1Like,
  telegramId: number,
): Promise<number | null> => {
  type ManagedRow = { communityId: number };
  const managed = await db
    .prepare(
      `SELECT id as communityId
       FROM communities
       WHERE owner_telegram_id = ?1
       ORDER BY id ASC
       LIMIT 1`,
    )
    .bind(telegramId)
    .first<ManagedRow>();
  return managed?.communityId ?? null;
};

const assertLeaderOwnership = async (
  db: D1Like,
  communityId: number,
  telegramId: number,
): Promise<boolean> => {
  type OwnershipRow = { owned: number };
  const ownership = await db
    .prepare(
      `SELECT COUNT(*) as owned
       FROM communities
       WHERE id = ?1 AND owner_telegram_id = ?2`,
    )
    .bind(communityId, telegramId)
    .first<OwnershipRow>();

  return Number(ownership?.owned ?? 0) > 0;
};

const normalizeUsername = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
};

communitiesRoute.post('/', async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = createCommunitySchema.safeParse(payload);

  if (!parsed.success) {
    return c.json({ ok: false, error: 'invalid_payload' }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: 'database_unavailable' }, 503);
  }

  const effectiveTelegramId = identity.telegramId;
  const capabilities = await resolveUserCommunityCapabilities(c.env.DB, effectiveTelegramId);

  if (!capabilities.canCreateQahal) {
    return c.json({ ok: false, error: 'cannot_create_qahal' }, 409);
  }

  const { name, city, country, latitude, longitude } = parsed.data;

  const createdCommunity = await c.env.DB.prepare(
    `INSERT INTO communities (
      name,
      city,
      country,
      latitude,
      longitude,
      default_member_state,
      owner_telegram_id, type
    ) VALUES (?1, ?2, ?3, ?4, ?5, 'not_member', ?6, ?7) RETURNING id, name, city`,
  )
    .bind(
      name.trim(),
      city?.trim() ?? null,
      country?.trim() ?? null,
      latitude === undefined ? null : coarse(latitude),
      longitude === undefined ? null : coarse(longitude),
      effectiveTelegramId,
      parsed.data.type,
    )
    .first<{ id: number; name: string; city: string | null }>();

  if (!createdCommunity) {
    return c.json({ ok: false, error: 'create_failed' }, 500);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_community_memberships (telegram_id, community_id, status)
     VALUES (?1, ?2, 'member')
     ON CONFLICT(telegram_id, community_id) DO UPDATE SET
       status='member',
       updated_at=CURRENT_TIMESTAMP`,
  )
    .bind(effectiveTelegramId, createdCommunity.id)
    .run();

  return c.json({
    ok: true,
    community: {
      id: createdCommunity.id,
      name: createdCommunity.name,
      city: createdCommunity.city,
      canManage: true,
      canCreateQahal: false,
    },
  });
});

communitiesRoute.get('/manage', async (c) => {
  const telegramIdRaw = c.req.query('telegramId');
  const requestedTelegramId = Number(telegramIdRaw);
  if (!Number.isFinite(requestedTelegramId)) {
    return c.json({ ok: false, error: 'invalid_telegram_id' }, 400);
  }

  const identity = await requireTelegramIdentity(c, requestedTelegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: 'database_unavailable' }, 503);
  }

  const effectiveTelegramId = identity.telegramId;
  const managedCommunityId = await getManagedCommunityIdByOwner(c.env.DB, effectiveTelegramId);

  if (!managedCommunityId) {
    return c.json({ ok: false, error: 'not_qahal_leader' }, 403);
  }

  type CommunityRow = {
    id: number;
    name: string;
    city: string | null;
    type: 'in_person' | 'online';
  };
  type SlotRow = { id: number; weekday: number; timeMinutes: number };
  type MemberRow = {
    telegramId: number;
    firstName: string | null;
    username: string | null;
  };

  const [community, slots, members] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, name, city, type
         FROM communities
         WHERE id = ?1
         LIMIT 1`,
    )
      .bind(managedCommunityId)
      .first<CommunityRow>(),
    c.env.DB.prepare(
      `SELECT id,
                weekday,
                time_minutes as timeMinutes
         FROM community_meeting_slots
         WHERE community_id = ?1
         ORDER BY weekday ASC, time_minutes ASC`,
    )
      .bind(managedCommunityId)
      .all<SlotRow>(),
    c.env.DB.prepare(
      `SELECT u.telegram_id as telegramId,
                u.first_name as firstName,
                u.username as username
         FROM user_community_memberships m
         JOIN users u ON u.telegram_id = m.telegram_id
         WHERE m.community_id = ?1
           AND m.status = 'member'
         ORDER BY lower(COALESCE(u.first_name, u.username, '')) ASC`,
    )
      .bind(managedCommunityId)
      .all<MemberRow>(),
  ]);

  if (!community) {
    return c.json({ ok: false, error: 'community_not_found' }, 404);
  }

  return c.json({
    ok: true,
    community: {
      communityId: community.id,
      communityName: community.name,
      city: community.city,
      type: community.type,
      canManage: true,
      canCreateQahal: false,
      meetingSlots:
        (await readPrivate<{ slots: SlotRow[] }>(c.env, `community:${managedCommunityId}:meetings`))
          ?.slots ?? [],
      members: await Promise.all(
        (members.results ?? []).map(async (member) => {
          const profile = await readProfile(c.env, member.telegramId);
          return {
            telegramId: member.telegramId,
            firstName: profile.firstName ?? null,
            username: profile.username ?? null,
          };
        }),
      ),
    },
  });
});

communitiesRoute.patch('/:communityId', async (c) => {
  const communityId = Number(c.req.param('communityId'));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: 'invalid_community_id' }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = renameCommunitySchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'invalid_payload' }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: 'database_unavailable' }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(c.env.DB, communityId, identity.telegramId);
  if (!ownsCommunity) {
    return c.json({ ok: false, error: 'forbidden' }, 403);
  }

  await c.env.DB.prepare(
    `UPDATE communities
     SET name = ?1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?2`,
  )
    .bind(parsed.data.name.trim(), communityId)
    .run();

  return c.json({ ok: true });
});

communitiesRoute.put('/:communityId/meeting-slots', async (c) => {
  const communityId = Number(c.req.param('communityId'));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: 'invalid_community_id' }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = meetingSlotsUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'invalid_payload' }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: 'database_unavailable' }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(c.env.DB, communityId, identity.telegramId);
  if (!ownsCommunity) {
    return c.json({ ok: false, error: 'forbidden' }, 403);
  }

  const slots = Array.from(
    new Map(
      parsed.data.slots.map((slot) => [`${slot.weekday}:${slot.timeMinutes}`, slot]),
    ).values(),
  ).map((slot, index) => ({ ...slot, id: index + 1 }));
  await database(c.env.DB).batch([
    await privateStatement(c.env, `community:${communityId}:meetings`, {
      ...(await readPrivate<Record<string, unknown>>(c.env, `community:${communityId}:meetings`)),
      slots,
    }),
    database(c.env.DB)
      .prepare('DELETE FROM community_meeting_slots WHERE community_id = ?')
      .bind(communityId),
  ]);

  return c.json({ ok: true });
});

communitiesRoute.post('/:communityId/members/by-username', async (c) => {
  const communityId = Number(c.req.param('communityId'));
  if (!Number.isFinite(communityId)) {
    return c.json({ ok: false, error: 'invalid_community_id' }, 400);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = addCommunityMemberByUsernameSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ ok: false, error: 'invalid_payload' }, 400);
  }

  const identity = await requireTelegramIdentity(c, parsed.data.telegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: false, error: 'database_unavailable' }, 503);
  }

  const ownsCommunity = await assertLeaderOwnership(c.env.DB, communityId, identity.telegramId);
  if (!ownsCommunity) {
    return c.json({ ok: false, error: 'forbidden' }, 403);
  }

  const normalizedUsername = normalizeUsername(parsed.data.username);

  type UserRow = {
    telegramId: number;
    username: string | null;
    firstName: string | null;
  };
  const targetUser = await c.env.DB.prepare(
    `SELECT telegram_id as telegramId,
              username,
              first_name as firstName
       FROM users
       WHERE username_index = ?1
       LIMIT 1`,
  )
    .bind(await usernameIndex(c.env, normalizedUsername))
    .first<UserRow>();

  if (!targetUser) {
    return c.json({ ok: false, error: 'user_not_found' }, 404);
  }

  type ExistingMemberRow = { count: number };
  const memberElsewhere = await c.env.DB.prepare(
    `SELECT COUNT(*) as count
       FROM user_community_memberships
       WHERE telegram_id = ?1
         AND status = 'member'
         AND community_id != ?2`,
  )
    .bind(targetUser.telegramId, communityId)
    .first<ExistingMemberRow>();

  if (Number(memberElsewhere?.count ?? 0) > 0) {
    return c.json({ ok: false, error: 'already_member_elsewhere' }, 409);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_community_memberships (telegram_id, community_id, status)
       VALUES (?1, ?2, 'member')
       ON CONFLICT(telegram_id, community_id) DO UPDATE SET
         status='member',
         updated_at=CURRENT_TIMESTAMP`,
  )
    .bind(targetUser.telegramId, communityId)
    .run();

  return c.json({
    ok: true,
    member: {
      telegramId: targetUser.telegramId,
      firstName: (await readProfile(c.env, targetUser.telegramId)).firstName ?? null,
      username: (await readProfile(c.env, targetUser.telegramId)).username ?? null,
    },
  });
});

communitiesRoute.post('/:communityId/join', async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsedRequest = membershipRequestSchema.safeParse(payload);
  if (!parsedRequest.success) return c.json({ ok: false, error: 'invalid_payload' }, 400);
  const identity = await requireTelegramIdentity(c, parsedRequest.data.telegramId);
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const id = Number(c.req.param('communityId'));
  const db = database(c.env.DB);
  const existing = await db.prepare('SELECT id FROM communities WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ ok: false, error: 'community_not_found' }, 404);
  const result = await db
    .prepare(
      `INSERT INTO user_community_memberships(telegram_id, community_id, status)
    SELECT ?, ?, 'requested' WHERE NOT EXISTS(SELECT 1 FROM user_community_memberships WHERE telegram_id = ? AND status = 'member' AND community_id != ?)
    ON CONFLICT(telegram_id, community_id) DO NOTHING`,
    )
    .bind(identity.telegramId, id, identity.telegramId, id)
    .run();
  const member = await db
    .prepare(
      'SELECT status FROM user_community_memberships WHERE telegram_id = ? AND community_id = ?',
    )
    .bind(identity.telegramId, id)
    .first();
  if (!member) return c.json({ ok: false, error: 'already_member_elsewhere' }, 409);
  return c.json({ ok: true });
});

communitiesRoute.get('/:communityId/meeting', async (c) => {
  const identity = await requireTelegramIdentity(c, Number(c.req.query('telegramId')));
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const id = Number(c.req.param('communityId'));
  const db = database(c.env.DB);
  const member = await db
    .prepare(
      `SELECT 1 FROM communities c WHERE c.id = ? AND (c.owner_telegram_id = ? OR EXISTS(
    SELECT 1 FROM user_community_memberships m WHERE m.community_id = c.id AND m.telegram_id = ? AND m.status = 'member'))`,
    )
    .bind(id, identity.telegramId, identity.telegramId)
    .first();
  if (!member) return c.json({ ok: false, error: 'forbidden' }, 403);
  const details = await readPrivate<{ link?: string; slots?: unknown[] }>(
    c.env,
    `community:${id}:link`,
  );
  return c.json({
    ok: true,
    link: details?.link ?? null,
    slots:
      (await readPrivate<{ slots: unknown[] }>(c.env, `community:${id}:meetings`))?.slots ?? [],
  });
});

communitiesRoute.put('/:communityId/meeting', async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsedRequest = membershipRequestSchema.safeParse(payload);
  if (!parsedRequest.success) return c.json({ ok: false, error: 'invalid_payload' }, 400);
  const identity = await requireTelegramIdentity(c, parsedRequest.data.telegramId);
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const id = Number(c.req.param('communityId'));
  if (!(await assertLeaderOwnership(database(c.env.DB), id, identity.telegramId)))
    return c.json({ ok: false, error: 'forbidden' }, 403);
  if (!meetingLinkSchema.safeParse(payload).success)
    return c.json({ ok: false, error: 'invalid_link' }, 400);
  await (
    await privateStatement(c.env, `community:${id}:link`, { link: payload.link || null })
  ).run();
  return c.json({ ok: true });
});
