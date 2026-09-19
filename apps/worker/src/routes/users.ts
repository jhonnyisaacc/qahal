import { database } from '../lib/db';
import { readProfile, profileStatements, patchProfile } from '../services/privateData';
import { Hono } from 'hono';
import { demoScenarioApplySchema, onboardingSubmitSchema } from '@qahal/shared';
import type { Bindings } from '../types/env';
import { requireTelegramIdentity } from '../lib/telegramIdentity';
import { isProductionRequest } from '../lib/runtimeEnv';
import {
  applyDemoScenario,
  clearDemoUserState,
  getDemoScenarioDefinitions,
} from '../services/demoScenarios';

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      all: <T>() => Promise<{ results: T[] }>;
      first: <T>() => Promise<T | null>;
    };
  };
};

const hasD1 = (db: unknown): db is D1Like => {
  return typeof db === 'object' && db !== null && 'prepare' in db;
};

const EMUNAH_BADGE = { key: 'emunah', label: 'Emunah' };

const normalizeEmunahState = (
  value: unknown,
): 'leader' | 'experienced' | 'starting' | undefined => {
  return value === 'leader' || value === 'experienced' || value === 'starting' ? value : undefined;
};

const normalizeApprovalFlag = (value: unknown): boolean => {
  return value === true || value === 1 || value === '1';
};

const shouldGrantEmunahBadge = (answers: Record<string, string> | undefined): boolean => {
  if (!answers) {
    return false;
  }

  const doctrinalSteps = ['1', '2', '3', '4', '5', '6', '7'];
  return doctrinalSteps.every((stepKey) => {
    return (
      String(answers[stepKey] ?? '')
        .trim()
        .toLowerCase() === 'yes'
    );
  });
};

const selectUserBase = async (
  db: D1Like,
  telegramId: number,
): Promise<Record<string, unknown> | null> => {
  return db
    .prepare(
      `SELECT telegram_id as telegramId, language_code as languageCode, city,
    emunah_state as emunahState, emunah_level_approved as emunahLevelApproved,
    created_at as createdAt, onboarding_completed as onboardingCompleted
    FROM users WHERE telegram_id = ?`,
    )
    .bind(telegramId)
    .first<Record<string, unknown>>();
};

const selectUserBadges = async (db: D1Like, telegramId: number): Promise<string[]> => {
  try {
    type BadgeRow = { badgeLabel: string };
    const result = await db
      .prepare(
        `SELECT badge_label as badgeLabel
       FROM user_badges
       WHERE telegram_id = ?1
       ORDER BY badge_label ASC`,
      )
      .bind(telegramId)
      .all<BadgeRow>();

    return (result.results ?? []).map((row) => row.badgeLabel);
  } catch {
    return [];
  }
};

const selectUserQahalName = async (db: D1Like, telegramId: number): Promise<string | null> => {
  try {
    type QahalRow = { qahalName: string };
    const memberCommunity = await db
      .prepare(
        `SELECT c.name as qahalName
         FROM user_community_memberships m
         JOIN communities c ON c.id = m.community_id
         WHERE m.telegram_id = ?1 AND m.status = 'member'
         ORDER BY m.updated_at DESC
         LIMIT 1`,
      )
      .bind(telegramId)
      .first<QahalRow>();

    return memberCommunity?.qahalName ?? null;
  } catch {
    return null;
  }
};

const selectUserCommunityCapabilities = async (
  db: D1Like,
  telegramId: number,
): Promise<{
  managedCommunityId: number | null;
  canManageQahal: boolean;
  canCreateQahal: boolean;
}> => {
  type CountRow = { count: number };
  type ManagedRow = { communityId: number };

  let memberCount: CountRow | null = null;
  let managedCommunity: ManagedRow | null = null;

  try {
    [memberCount, managedCommunity] = await Promise.all([
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
  } catch {
    return {
      managedCommunityId: null,
      canManageQahal: false,
      canCreateQahal: false,
    };
  }

  const canManageQahal = Boolean(managedCommunity);
  const hasMemberCommunity = Number(memberCount?.count ?? 0) > 0;

  return {
    managedCommunityId: managedCommunity?.communityId ?? null,
    canManageQahal,
    canCreateQahal: !hasMemberCommunity && !canManageQahal,
  };
};

const selectLatestLocation = async (
  db: D1Like,
  telegramId: number,
): Promise<{ latestLatitude?: number; latestLongitude?: number }> => {
  try {
    type LocationRow = {
      latestLatitude: number;
      latestLongitude: number;
    };

    const latest = await db
      .prepare(
        `SELECT latitude as latestLatitude,
                longitude as latestLongitude
         FROM user_locations
         WHERE telegram_id = ?1
         ORDER BY id DESC
         LIMIT 1`,
      )
      .bind(telegramId)
      .first<LocationRow>();

    if (!latest) {
      return {};
    }

    return {
      latestLatitude: latest.latestLatitude,
      latestLongitude: latest.latestLongitude,
    };
  } catch {
    return {};
  }
};

const selectUser = async (
  db: D1Like,
  telegramId: number,
): Promise<Record<string, unknown> | null> => {
  const base = await selectUserBase(db, telegramId);
  if (!base) {
    return null;
  }

  const [baseBadges, qahalName, latestLocation, capabilities] = await Promise.all([
    selectUserBadges(db, telegramId),
    selectUserQahalName(db, telegramId),
    selectLatestLocation(db, telegramId),
    selectUserCommunityCapabilities(db, telegramId),
  ]);
  const emunahState = normalizeEmunahState(base.emunahState);
  const emunahLevelApproved =
    emunahState === 'leader' ? normalizeApprovalFlag(base.emunahLevelApproved) : true;

  const badgesSet = new Set<string>(baseBadges);

  if (qahalName) {
    badgesSet.add('Kehilah');
  }

  const createdAtValue = base.createdAt;
  if (typeof createdAtValue === 'string' && createdAtValue.length > 0) {
    const createdAt = new Date(createdAtValue);
    if (!Number.isNaN(createdAt.getTime())) {
      const now = new Date();
      let years = now.getFullYear() - createdAt.getFullYear();
      const anniversaryPending =
        now.getMonth() < createdAt.getMonth() ||
        (now.getMonth() === createdAt.getMonth() && now.getDate() < createdAt.getDate());
      if (anniversaryPending) {
        years -= 1;
      }
      badgesSet.add(`Years in Emunah (${Math.max(0, years)})`);
    }
  }

  return {
    ...base,
    emunahState,
    emunahLevelApproved,
    badges: Array.from(badgesSet),
    qahalName,
    managedCommunityId: capabilities.managedCommunityId,
    canManageQahal: capabilities.canManageQahal,
    canCreateQahal:
      capabilities.canCreateQahal && !(emunahState === 'leader' && !emunahLevelApproved),
    ...latestLocation,
  };
};

const syncEmunahBadge = async (db: D1Like, telegramId: number, grant: boolean) => {
  if (grant) {
    await db
      .prepare(
        `INSERT INTO user_badges (telegram_id, badge_key, badge_label)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(telegram_id, badge_key) DO UPDATE SET
           badge_label=excluded.badge_label,
           updated_at=CURRENT_TIMESTAMP`,
      )
      .bind(telegramId, EMUNAH_BADGE.key, EMUNAH_BADGE.label)
      .run();
    return;
  }

  await db
    .prepare(
      `DELETE FROM user_badges
       WHERE telegram_id = ?1 AND badge_key = ?2`,
    )
    .bind(telegramId, EMUNAH_BADGE.key)
    .run();
};

export const usersRoute = new Hono<{ Bindings: Bindings }>();

usersRoute.get('/demo-scenarios', async (c) => {
  if (isProductionRequest(c)) {
    return c.json({ ok: false, error: 'dev_only' }, 403);
  }

  return c.json({
    ok: true,
    scenarios: getDemoScenarioDefinitions(),
  });
});

usersRoute.post('/demo-scenarios/apply', async (c) => {
  if (isProductionRequest(c)) {
    return c.json({ ok: false, error: 'dev_only' }, 403);
  }

  const payload = await c.req.json().catch(() => null);
  const parsed = demoScenarioApplySchema.safeParse(payload);
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

  try {
    const scenario = await applyDemoScenario(c.env.DB, identity.telegramId, parsed.data.scenarioId);

    return c.json({ ok: true, scenario });
  } catch (error) {
    console.error('demo scenario apply failed', {
      error,
      telegramId: identity.telegramId,
      scenarioId: parsed.data.scenarioId,
    });
    return c.json({ ok: false, error: 'scenario_apply_failed' }, 500);
  }
});

usersRoute.post('/onboarding', async (c) => {
  const parsed = onboardingSubmitSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ ok: false, error: 'invalid_payload' }, 400);
  const { telegramId, firstName, city, languageCode, emunahState, answers } = parsed.data;
  const identity = await requireTelegramIdentity(c, telegramId);
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const db = database(c.env.DB);
  const profile = await readProfile(c.env, telegramId);
  // The identity helper has verified this signed Telegram payload and account match.
  const initData =
    c.req.header('x-telegram-init-data') ||
    c.req.header('authorization')?.replace(/^tma\s+/i, '') ||
    '';
  const rawUser = new URLSearchParams(initData).get('user');
  const telegramUser = rawUser ? JSON.parse(rawUser) : {};
  const privateWrites = await profileStatements(c.env, telegramId, {
    ...profile,
    firstName,
    answers: answers ?? {},
    username: telegramUser.username ?? profile.username,
  });
  await db.batch([
    db
      .prepare(
        `INSERT INTO users(telegram_id, city, language_code, emunah_state, emunah_level_approved, onboarding_completed)
    VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT(telegram_id) DO UPDATE SET city = excluded.city,
    language_code = excluded.language_code, emunah_state = excluded.emunah_state,
    emunah_level_approved = CASE WHEN excluded.emunah_state = 'leader' THEN
      CASE WHEN users.emunah_state = 'leader' THEN users.emunah_level_approved ELSE 0 END ELSE 1 END,
    onboarding_completed = 1, updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        telegramId,
        city ?? null,
        languageCode,
        emunahState ?? null,
        emunahState === 'leader' ? 0 : 1,
      ),
    ...privateWrites,
  ]);
  await syncEmunahBadge(db, telegramId, shouldGrantEmunahBadge(answers));
  return c.json({
    ok: true,
    user: {
      ...(await selectUser(db, telegramId)),
      ...(await readProfile(c.env, telegramId)),
      answers: undefined,
    },
  });
});

usersRoute.get('/:telegramId', async (c) => {
  const requestedTelegramId = Number(c.req.param('telegramId'));
  if (!Number.isFinite(requestedTelegramId)) {
    return c.json({ ok: false, error: 'invalid_telegram_id' }, 400);
  }

  const identity = await requireTelegramIdentity(c, requestedTelegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  const effectiveTelegramId = identity.telegramId;

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, user: null });
  }

  const user = await selectUser(c.env.DB, effectiveTelegramId);

  return c.json({
    ok: true,
    user: user
      ? { ...user, ...(await readProfile(c.env, effectiveTelegramId)), answers: undefined }
      : null,
  });
});

usersRoute.put('/:telegramId/profile', async (c) => {
  const id = Number(c.req.param('telegramId'));
  const identity = await requireTelegramIdentity(c, id);
  if (!identity.ok) return c.json({ ok: false, error: identity.error }, identity.status);
  const payload = await c.req.json().catch(() => null);
  if (
    !payload ||
    (payload.firstName !== undefined &&
      (typeof payload.firstName !== 'string' ||
        !payload.firstName.trim() ||
        payload.firstName.length > 80)) ||
    (payload.birthDate !== undefined &&
      payload.birthDate !== null &&
      (typeof payload.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.birthDate)))
  ) {
    return c.json({ ok: false, error: 'invalid_payload' }, 400);
  }
  const changes: { firstName?: string; birthDate?: string | null } = {};
  if (payload.firstName !== undefined) changes.firstName = payload.firstName.trim();
  if (payload.birthDate !== undefined) changes.birthDate = payload.birthDate;
  const db = database(c.env.DB);
  const profile = await patchProfile(c.env, id, changes);
  return c.json({
    ok: true,
    user: { ...(await selectUser(db, id)), ...profile, answers: undefined },
  });
});

usersRoute.delete('/:telegramId/local-reset', async (c) => {
  const requestedTelegramId = Number(c.req.param('telegramId'));
  if (!Number.isFinite(requestedTelegramId)) {
    return c.json({ ok: false, error: 'invalid_telegram_id' }, 400);
  }

  const identity = await requireTelegramIdentity(c, requestedTelegramId);
  if (!identity.ok) {
    return c.json({ ok: false, error: identity.error }, identity.status);
  }

  const effectiveTelegramId = identity.telegramId;

  const requestHost = new URL(c.req.url).hostname.toLowerCase();
  const isLocalHost =
    requestHost === 'localhost' || requestHost === '127.0.0.1' || requestHost === '::1';

  if (!isLocalHost) {
    return c.json({ ok: false, error: 'local_only' }, 403);
  }

  if (!hasD1(c.env.DB)) {
    return c.json({ ok: true, reset: false });
  }

  try {
    await clearDemoUserState(c.env.DB, effectiveTelegramId, { deleteUser: true });
  } catch {
    // Ignore missing tables to keep local reset resilient across migrations.
  }

  return c.json({ ok: true, reset: true });
});
