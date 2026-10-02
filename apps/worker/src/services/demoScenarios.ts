import type { DemoScenarioDefinition, DemoScenarioId, EmunahState } from '@qahal/shared';
import { getSeedLocationByCity } from './seedData';

export type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      run: () => Promise<unknown>;
    };
  };
};

type DemoBadgeSeed = {
  key: string;
  label: string;
};

type DemoMembershipSeed = {
  communityId: number;
  status: 'not_member' | 'requested' | 'member';
};

type DemoLocationSeed = {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
};

type DemoUserSeed = {
  firstName: string;
  username: string | null;
  city: string | null;
  languageCode: 'en' | 'es' | 'he';
  onboardingCompleted: boolean;
  emunahState?: EmunahState;
  emunahLevelApproved: boolean;
  yearsInEmunah: number;
  birthDate?: string | null;
  location?: DemoLocationSeed | null;
};

type DemoScenarioConfig = DemoScenarioDefinition & {
  user?: DemoUserSeed;
  answers?: Record<string, string>;
  badges?: DemoBadgeSeed[];
  memberships?: DemoMembershipSeed[];
  afterApply?: (db: D1Like, telegramId: number) => Promise<void>;
};

type DemoSupportUserSeed = {
  telegramId: number;
  firstName: string;
  username: string;
  city: string;
  languageCode: 'en' | 'es' | 'he';
  yearsInEmunah: number;
  memberships: DemoMembershipSeed[];
};

const MANAGED_DEMO_COMMUNITY_ID = 1;
const CONFLICT_MEMBER_COMMUNITY_ID = 9;

const yesAnswers = (): Record<string, string> => ({
  '1': 'yes',
  '2': 'yes',
  '3': 'yes',
  '4': 'yes',
  '5': 'yes',
  '6': 'yes',
  '7': 'yes',
  '8': 'yes',
  '9': 'yes',
});

const createLocationSeed = (city: string): DemoLocationSeed | null => {
  const location = getSeedLocationByCity(city);
  if (!location) {
    return null;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    country: location.country,
  };
};

const demoSupportUsers: DemoSupportUserSeed[] = [
  {
    telegramId: 980001,
    firstName: 'Abigail Stone',
    username: 'demo_member_one',
    city: 'Buenos Aires',
    languageCode: 'en',
    yearsInEmunah: 6,
    memberships: [{ communityId: MANAGED_DEMO_COMMUNITY_ID, status: 'member' }],
  },
  {
    telegramId: 980002,
    firstName: 'Uri Calderon',
    username: 'demo_member_two',
    city: 'Buenos Aires',
    languageCode: 'en',
    yearsInEmunah: 4,
    memberships: [{ communityId: MANAGED_DEMO_COMMUNITY_ID, status: 'member' }],
  },
  {
    telegramId: 980003,
    firstName: 'Natan Flores',
    username: 'demo_conflict_member',
    city: 'Lima',
    languageCode: 'en',
    yearsInEmunah: 5,
    memberships: [{ communityId: CONFLICT_MEMBER_COMMUNITY_ID, status: 'member' }],
  },
  {
    telegramId: 980004,
    firstName: 'Tal Moreno',
    username: 'demo_available_member',
    city: 'Buenos Aires',
    languageCode: 'en',
    yearsInEmunah: 2,
    memberships: [],
  },
];

const demoScenarioConfigs: DemoScenarioConfig[] = [
  {
    id: 'fresh-onboarding',
    label: 'Fresh Onboarding',
    description: 'A new user with no completed onboarding and no persisted community state.',
    category: 'onboarding',
    screens: ['onboarding-carousel', 'onboarding-state', 'onboarding-questions', 'onboarding-data'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'New Pilgrim',
      username: null,
      city: null,
      languageCode: 'en',
      onboardingCompleted: false,
      emunahLevelApproved: true,
      yearsInEmunah: 0,
      birthDate: null,
      location: null,
    },
  },
  {
    id: 'experienced-no-qahal',
    label: 'Experienced, No Qahal',
    description:
      'Onboarding is complete, the user has no congregation, and nearby join actions are available.',
    category: 'home',
    screens: ['home', 'map', 'profile'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Leah Navarro',
      username: 'demo_experienced_no_qahal',
      city: 'Buenos Aires',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: 4,
      birthDate: null,
      location: createLocationSeed('Buenos Aires'),
    },
    answers: yesAnswers(),
    badges: [{ key: 'emunah', label: 'Emunah' }],
  },
  {
    id: 'pending-join-request',
    label: 'Pending Join Request',
    description:
      'The user already has one pending request, so requesting another congregation should hit the existing pending state.',
    category: 'home',
    screens: ['home', 'map', 'profile'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Jonas Ruiz',
      username: 'demo_pending_request',
      city: 'Lima',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: 3,
      birthDate: null,
      location: createLocationSeed('Lima'),
    },
    answers: yesAnswers(),
    badges: [{ key: 'emunah', label: 'Emunah' }],
    memberships: [{ communityId: 8, status: 'requested' }],
  },
  {
    id: 'member-established',
    label: 'Established Member',
    description:
      'The user already belongs to one congregation and should see member-state behavior across Home and Profile.',
    category: 'home',
    screens: ['home', 'map', 'profile'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Mara Cohen',
      username: 'demo_member_established',
      city: 'Buenos Aires',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: 5,
      birthDate: '29',
      location: createLocationSeed('Buenos Aires'),
    },
    answers: yesAnswers(),
    badges: [
      { key: 'emunah', label: 'Emunah' },
      { key: 'hebrew-teacher', label: 'Hebrew Teacher' },
    ],
    memberships: [{ communityId: 3, status: 'member' }],
  },
  {
    id: 'leader-approval-pending',
    label: 'Leader Approval Pending',
    description:
      'A leader candidate completed onboarding, but approval is still pending and qahal creation should remain blocked.',
    category: 'edge-case',
    screens: ['home', 'profile'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Ezra Ben-David',
      username: 'demo_leader_pending',
      city: 'Madrid',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'leader',
      emunahLevelApproved: false,
      yearsInEmunah: 6,
      birthDate: '34',
      location: createLocationSeed('Madrid'),
    },
    answers: yesAnswers(),
    badges: [{ key: 'emunah', label: 'Emunah' }],
  },
  {
    id: 'leader-managed-qahal',
    label: 'Leader Managing Qahal',
    description:
      'An approved leader owns a qahal with meeting slots and members, ready for management flows.',
    category: 'manage',
    screens: ['manage-qahal', 'home', 'profile'],
    resetsWorldData: true,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Miriam Levi',
      username: 'demo_leader_managed',
      city: 'Buenos Aires',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'leader',
      emunahLevelApproved: true,
      yearsInEmunah: 7,
      birthDate: '42',
      location: createLocationSeed('Buenos Aires'),
    },
    answers: yesAnswers(),
    badges: [
      { key: 'emunah', label: 'Emunah' },
      { key: 'messenger', label: 'Messenger' },
    ],
    memberships: [{ communityId: MANAGED_DEMO_COMMUNITY_ID, status: 'member' }],
    afterApply: async (db, telegramId) => {
      await runStatement(
        db,
        `UPDATE communities
         SET owner_telegram_id = ?1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?2`,
        telegramId,
        MANAGED_DEMO_COMMUNITY_ID,
      );
      await replaceMeetingSlots(db, MANAGED_DEMO_COMMUNITY_ID, [
        { weekday: 2, timeMinutes: 1140 },
        { weekday: 6, timeMinutes: 630 },
      ]);
    },
  },
  {
    id: 'starting-city-limited',
    label: 'Starting, City Limited',
    description:
      'A starting user with a city and location, ready to verify the restricted Home and Map experience.',
    category: 'map',
    screens: ['home', 'map', 'profile'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Noah Ortiz',
      username: 'demo_starting_city',
      city: 'Lima',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'starting',
      emunahLevelApproved: true,
      yearsInEmunah: 1,
      birthDate: null,
      location: createLocationSeed('Lima'),
    },
    answers: {
      '1': 'yes',
      '2': 'yes',
      '3': 'yes',
      '4': 'yes',
    },
  },
  {
    id: 'no-city-selected',
    label: 'No City Selected',
    description: 'Onboarding is complete, but the profile has no city or saved location yet.',
    category: 'profile',
    screens: ['profile', 'home'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Ari Solis',
      username: 'demo_no_city',
      city: null,
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: 3,
      birthDate: null,
      location: null,
    },
    answers: yesAnswers(),
    badges: [{ key: 'emunah', label: 'Emunah' }],
  },
  {
    id: 'partial-onboarding-answers',
    label: 'Partial Answers, No Emunah Badge',
    description:
      'A completed profile with mixed onboarding answers to verify the absence of the Emunah badge.',
    category: 'edge-case',
    screens: ['profile', 'home'],
    resetsWorldData: false,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Rivka Soto',
      username: 'demo_partial_answers',
      city: 'Jacksonville',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: 1,
      birthDate: null,
      location: createLocationSeed('Jacksonville'),
    },
    answers: {
      '1': 'yes',
      '2': 'yes',
      '3': 'no',
      '4': 'yes',
      '5': 'yes',
      '6': 'yes',
      '7': 'yes',
      '8': 'yes',
      '9': 'yes',
    },
    badges: [{ key: 'hebrew-student', label: 'Hebrew Student' }],
  },
  {
    id: 'community-member-conflict',
    label: 'Managed Qahal With Member Conflict',
    description:
      'An approved leader can manage a qahal while a reusable demo username remains a member elsewhere for conflict testing.',
    category: 'edge-case',
    screens: ['manage-qahal', 'home', 'profile'],
    resetsWorldData: true,
    resetsCurrentUserData: true,
    user: {
      firstName: 'Dina Halevi',
      username: 'demo_member_conflict',
      city: 'Buenos Aires',
      languageCode: 'en',
      onboardingCompleted: true,
      emunahState: 'leader',
      emunahLevelApproved: true,
      yearsInEmunah: 8,
      birthDate: '38',
      location: createLocationSeed('Buenos Aires'),
    },
    answers: yesAnswers(),
    badges: [
      { key: 'emunah', label: 'Emunah' },
      { key: 'messenger', label: 'Messenger' },
    ],
    memberships: [{ communityId: MANAGED_DEMO_COMMUNITY_ID, status: 'member' }],
    afterApply: async (db, telegramId) => {
      await runStatement(
        db,
        `UPDATE communities
         SET owner_telegram_id = ?1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?2`,
        telegramId,
        MANAGED_DEMO_COMMUNITY_ID,
      );
      await replaceMeetingSlots(db, MANAGED_DEMO_COMMUNITY_ID, [
        { weekday: 1, timeMinutes: 1140 },
        { weekday: 4, timeMinutes: 1170 },
      ]);
    },
  },
];

const demoScenarioById = new Map<DemoScenarioId, DemoScenarioConfig>(
  demoScenarioConfigs.map((scenario) => [scenario.id, scenario]),
);

const buildCreatedAt = (yearsInEmunah: number): string => {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - Math.max(0, yearsInEmunah));
  return date.toISOString();
};

const runStatement = async (db: D1Like, query: string, ...args: unknown[]): Promise<void> => {
  await db
    .prepare(query)
    .bind(...args)
    .run();
};

const resolveOwnedCommunityIds = async (db: D1Like, telegramId: number): Promise<number[]> => {
  type CommunityRow = { communityId: number };
  const result = await db
    .prepare(
      `SELECT id as communityId
       FROM communities
       WHERE owner_telegram_id = ?1`,
    )
    .bind(telegramId)
    .all<CommunityRow>();

  return (result.results ?? []).map((row) => row.communityId);
};

const replaceMeetingSlots = async (
  db: D1Like,
  communityId: number,
  slots: Array<{ weekday: number; timeMinutes: number }>,
): Promise<void> => {
  await runStatement(
    db,
    `DELETE FROM community_meeting_slots
     WHERE community_id = ?1`,
    communityId,
  );

  for (const slot of slots) {
    await runStatement(
      db,
      `INSERT INTO community_meeting_slots (community_id, weekday, time_minutes)
       VALUES (?1, ?2, ?3)`,
      communityId,
      slot.weekday,
      slot.timeMinutes,
    );
  }
};

const upsertUser = async (db: D1Like, telegramId: number, seed: DemoUserSeed): Promise<void> => {
  await runStatement(
    db,
    `INSERT INTO users (
       telegram_id,
       username,
       first_name,
       city,
       language_code,
       birth_date,
       emunah_state,
       emunah_level_approved,
       onboarding_completed,
       created_at,
       updated_at
     )
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, CURRENT_TIMESTAMP)
     ON CONFLICT(telegram_id) DO UPDATE SET
       username=excluded.username,
       first_name=excluded.first_name,
       city=excluded.city,
       language_code=excluded.language_code,
       birth_date=excluded.birth_date,
       emunah_state=excluded.emunah_state,
       emunah_level_approved=excluded.emunah_level_approved,
       onboarding_completed=excluded.onboarding_completed,
       created_at=excluded.created_at,
       updated_at=CURRENT_TIMESTAMP`,
    telegramId,
    seed.username,
    seed.firstName,
    seed.city,
    seed.languageCode,
    seed.birthDate ?? null,
    seed.emunahState ?? null,
    seed.emunahLevelApproved ? 1 : 0,
    seed.onboardingCompleted ? 1 : 0,
    buildCreatedAt(seed.yearsInEmunah),
  );
};

const upsertLocation = async (
  db: D1Like,
  telegramId: number,
  location: DemoLocationSeed,
): Promise<void> => {
  await runStatement(
    db,
    `INSERT INTO user_locations (
       telegram_id,
       latitude,
       longitude,
       city,
       state,
       country,
       accuracy
     )
     VALUES (?1, ?2, ?3, ?4, NULL, ?5, NULL)`,
    telegramId,
    location.latitude,
    location.longitude,
    location.city ?? null,
    location.country ?? null,
  );
};

const insertAnswers = async (
  db: D1Like,
  telegramId: number,
  answers: Record<string, string>,
): Promise<void> => {
  for (const [questionKey, answerValue] of Object.entries(answers)) {
    await runStatement(
      db,
      `INSERT INTO user_onboarding_answers (telegram_id, question_key, answer_value)
       VALUES (?1, ?2, ?3)`,
      telegramId,
      questionKey,
      answerValue,
    );
  }
};

const insertBadges = async (
  db: D1Like,
  telegramId: number,
  badges: DemoBadgeSeed[],
): Promise<void> => {
  for (const badge of badges) {
    await runStatement(
      db,
      `INSERT INTO user_badges (telegram_id, badge_key, badge_label)
       VALUES (?1, ?2, ?3)`,
      telegramId,
      badge.key,
      badge.label,
    );
  }
};

const insertMemberships = async (
  db: D1Like,
  telegramId: number,
  memberships: DemoMembershipSeed[],
): Promise<void> => {
  for (const membership of memberships) {
    await runStatement(
      db,
      `INSERT INTO user_community_memberships (telegram_id, community_id, status)
       VALUES (?1, ?2, ?3)`,
      telegramId,
      membership.communityId,
      membership.status,
    );
  }
};

const resetSupportUsers = async (db: D1Like): Promise<void> => {
  for (const supportUser of demoSupportUsers) {
    await clearDemoUserState(db, supportUser.telegramId, { deleteUser: true });
  }
};

const seedSupportUsers = async (db: D1Like): Promise<void> => {
  for (const supportUser of demoSupportUsers) {
    const seed: DemoUserSeed = {
      firstName: supportUser.firstName,
      username: supportUser.username,
      city: supportUser.city,
      languageCode: supportUser.languageCode,
      onboardingCompleted: true,
      emunahState: 'experienced',
      emunahLevelApproved: true,
      yearsInEmunah: supportUser.yearsInEmunah,
      birthDate: null,
      location: createLocationSeed(supportUser.city),
    };

    await upsertUser(db, supportUser.telegramId, seed);
    if (seed.location) {
      await upsertLocation(db, supportUser.telegramId, seed.location);
    }
    await insertMemberships(db, supportUser.telegramId, supportUser.memberships);
  }
};

const resetWorldState = async (db: D1Like): Promise<void> => {
  await resetSupportUsers(db);
  await seedSupportUsers(db);
  await replaceMeetingSlots(db, MANAGED_DEMO_COMMUNITY_ID, []);
  await runStatement(
    db,
    `UPDATE communities
     SET owner_telegram_id = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?1`,
    MANAGED_DEMO_COMMUNITY_ID,
  );
};

export const clearDemoUserState = async (
  db: D1Like,
  telegramId: number,
  options?: { deleteUser?: boolean },
): Promise<void> => {
  let ownedCommunityIds: number[] = [];
  try {
    ownedCommunityIds = await resolveOwnedCommunityIds(db, telegramId);
  } catch {
    ownedCommunityIds = [];
  }

  for (const communityId of ownedCommunityIds) {
    try {
      await replaceMeetingSlots(db, communityId, []);
    } catch {
      // Keep cleanup resilient when local databases lag behind newer migrations.
    }
  }

  try {
    await runStatement(
      db,
      `UPDATE communities
       SET owner_telegram_id = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE owner_telegram_id = ?1`,
      telegramId,
    );
  } catch {
    // Ignore community ownership cleanup when the local schema does not have it yet.
  }

  const deleteStatements = [
    'DELETE FROM user_badges WHERE telegram_id = ?1',
    'DELETE FROM user_onboarding_answers WHERE telegram_id = ?1',
    'DELETE FROM user_community_memberships WHERE telegram_id = ?1',
    'DELETE FROM user_locations WHERE telegram_id = ?1',
  ];

  for (const query of deleteStatements) {
    try {
      await runStatement(db, query, telegramId);
    } catch {
      // Ignore missing tables to keep local reset resilient across migrations.
    }
  }

  if (options?.deleteUser) {
    try {
      await runStatement(db, 'DELETE FROM users WHERE telegram_id = ?1', telegramId);
    } catch {
      // Ignore missing users table in partially migrated local databases.
    }
  }
};

export const getDemoScenarioDefinitions = (): DemoScenarioDefinition[] => {
  return demoScenarioConfigs.map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    category: scenario.category,
    screens: [...scenario.screens],
    resetsWorldData: scenario.resetsWorldData,
    resetsCurrentUserData: scenario.resetsCurrentUserData,
  }));
};

export const getDemoScenarioDefinition = (scenarioId: DemoScenarioId): DemoScenarioDefinition => {
  const scenario = demoScenarioById.get(scenarioId);
  if (!scenario) {
    throw new Error(`unknown demo scenario: ${scenarioId}`);
  }

  return {
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    category: scenario.category,
    screens: [...scenario.screens],
    resetsWorldData: scenario.resetsWorldData,
    resetsCurrentUserData: scenario.resetsCurrentUserData,
  };
};

export const applyDemoScenario = async (
  db: D1Like,
  telegramId: number,
  scenarioId: DemoScenarioId,
): Promise<DemoScenarioDefinition> => {
  const scenario = demoScenarioById.get(scenarioId);
  if (!scenario) {
    throw new Error(`unknown demo scenario: ${scenarioId}`);
  }

  await resetWorldState(db);
  await clearDemoUserState(db, telegramId, { deleteUser: true });

  if (scenario.user) {
    await upsertUser(db, telegramId, scenario.user);
    if (scenario.user.location) {
      await upsertLocation(db, telegramId, scenario.user.location);
    }
  }

  if (scenario.answers) {
    await insertAnswers(db, telegramId, scenario.answers);
  }

  if (scenario.badges) {
    await insertBadges(db, telegramId, scenario.badges);
  }

  if (scenario.memberships) {
    await insertMemberships(db, telegramId, scenario.memberships);
  }

  if (scenario.afterApply) {
    await scenario.afterApply(db, telegramId);
  }

  return getDemoScenarioDefinition(scenarioId);
};
