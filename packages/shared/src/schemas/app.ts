import { z } from 'zod';

export const emunahStateSchema = z.enum(['leader', 'experienced', 'starting']);

export const onboardingSubmitSchema = z.object({
  telegramId: z.number().int().positive(),
  firstName: z.string().min(1).max(80),
  city: z.string().trim().min(1).max(120).optional(),
  languageCode: z.enum(['en', 'es', 'he']).default('en'),
  emunahState: emunahStateSchema.optional(),
  answers: z.record(z.string().min(1), z.string().min(1).max(16)).optional(),
});

export const locationUpsertSchema = z.object({
  telegramId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});

export const citySearchQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(120),
    userLat: z.coerce.number().min(-90).max(90).optional(),
    userLng: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine(
    (value) => {
      const hasLat = typeof value.userLat === 'number';
      const hasLng = typeof value.userLng === 'number';
      return hasLat === hasLng;
    },
    {
      message: 'userLat and userLng must be provided together',
    },
  );

export const citySuggestionSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().min(1),
});

export const citySearchResponseSchema = z.object({
  ok: z.literal(true),
  suggestions: z.array(citySuggestionSchema),
});

export const locationSaveSchema = z.object({
  telegramId: z.number().int().positive(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  telegramId: z.coerce.number().int().positive().optional(),
});

export const communityCardSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  city: z.string().min(1),
  distanceKm: z.number().nonnegative(),
  memberState: z.enum(['not_member', 'requested', 'member']),
  canManage: z.boolean().optional(),
  canCreateQahal: z.boolean().optional(),
});

export const nearbyResponseSchema = z.object({
  ok: z.literal(true),
  communities: z.array(communityCardSchema),
});

export const communityMeetingSlotSchema = z.object({
  id: z.number().int().positive(),
  weekday: z.number().int().min(0).max(6),
  timeMinutes: z.number().int().min(0).max(1439),
});

export const communityMemberSummarySchema = z.object({
  telegramId: z.number().int().positive(),
  firstName: z.string().nullable(),
  username: z.string().nullable(),
});

export const communityManagePayloadSchema = z.object({
  communityId: z.number().int().positive(),
  communityName: z.string().min(1),
  city: z.string().nullable(),
  type: z.enum(['in_person', 'online']),
  canManage: z.boolean(),
  canCreateQahal: z.boolean(),
  meetingSlots: z.array(communityMeetingSlotSchema),
  members: z.array(communityMemberSummarySchema),
});

export const communityManageResponseSchema = z.object({
  ok: z.literal(true),
  community: communityManagePayloadSchema,
});

const communityBase = {
  telegramId: z.number().int().positive(),
  name: z.string().trim().min(2).max(120),
};
export const createCommunitySchema = z.discriminatedUnion('type', [
  z.object({
    ...communityBase,
    type: z.literal('in_person'),
    city: z.string().trim().min(1).max(120),
    country: z.string().trim().min(1).max(120),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  z.object({
    ...communityBase,
    type: z.literal('online'),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.undefined(),
    longitude: z.undefined(),
  }),
]);

export const renameCommunitySchema = z.object({
  telegramId: z.number().int().positive(),
  name: z.string().trim().min(2).max(120),
});

export const meetingSlotsUpsertSchema = z.object({
  telegramId: z.number().int().positive(),
  slots: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        timeMinutes: z.number().int().min(0).max(1439),
      }),
    )
    .max(24),
});

export const addCommunityMemberByUsernameSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export const demoScenarioIdSchema = z.enum([
  'fresh-onboarding',
  'experienced-no-qahal',
  'pending-join-request',
  'member-established',
  'leader-approval-pending',
  'leader-managed-qahal',
  'starting-city-limited',
  'no-city-selected',
  'partial-onboarding-answers',
  'community-member-conflict',
]);

export const demoScenarioCategorySchema = z.enum([
  'onboarding',
  'home',
  'map',
  'manage',
  'profile',
  'edge-case',
]);

export const demoScenarioScreenSchema = z.enum([
  'onboarding-carousel',
  'onboarding-state',
  'onboarding-questions',
  'onboarding-data',
  'map',
  'home',
  'manage-qahal',
  'profile',
]);

export const demoScenarioDefinitionSchema = z.object({
  id: demoScenarioIdSchema,
  label: z.string().min(1).max(120),
  description: z.string().min(1).max(280),
  category: demoScenarioCategorySchema,
  screens: z.array(demoScenarioScreenSchema).min(1),
  resetsWorldData: z.boolean(),
  resetsCurrentUserData: z.boolean(),
});

export const demoScenarioListResponseSchema = z.object({
  ok: z.literal(true),
  scenarios: z.array(demoScenarioDefinitionSchema),
});

export const demoScenarioApplySchema = z.object({
  telegramId: z.number().int().positive(),
  scenarioId: demoScenarioIdSchema,
});

export const demoScenarioApplyResponseSchema = z.object({
  ok: z.literal(true),
  scenario: demoScenarioDefinitionSchema,
});

export type EmunahState = z.infer<typeof emunahStateSchema>;
export type OnboardingSubmit = z.infer<typeof onboardingSubmitSchema>;
export type LocationUpsert = z.infer<typeof locationUpsertSchema>;
export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;
export type CitySuggestion = z.infer<typeof citySuggestionSchema>;
export type CitySearchResponse = z.infer<typeof citySearchResponseSchema>;
export type LocationSave = z.infer<typeof locationSaveSchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type NearbyResponse = z.infer<typeof nearbyResponseSchema>;
export type CommunityCard = z.infer<typeof communityCardSchema>;
export type CommunityMeetingSlot = z.infer<typeof communityMeetingSlotSchema>;
export type CommunityMemberSummary = z.infer<typeof communityMemberSummarySchema>;
export type CommunityManagePayload = z.infer<typeof communityManagePayloadSchema>;
export type CommunityManageResponse = z.infer<typeof communityManageResponseSchema>;
export type CreateCommunity = z.infer<typeof createCommunitySchema>;
export type RenameCommunity = z.infer<typeof renameCommunitySchema>;
export type MeetingSlotsUpsert = z.infer<typeof meetingSlotsUpsertSchema>;
export type AddCommunityMemberByUsername = z.infer<typeof addCommunityMemberByUsernameSchema>;
export type DemoScenarioId = z.infer<typeof demoScenarioIdSchema>;
export type DemoScenarioCategory = z.infer<typeof demoScenarioCategorySchema>;
export type DemoScenarioScreen = z.infer<typeof demoScenarioScreenSchema>;
export type DemoScenarioDefinition = z.infer<typeof demoScenarioDefinitionSchema>;
export type DemoScenarioListResponse = z.infer<typeof demoScenarioListResponseSchema>;
export type DemoScenarioApply = z.infer<typeof demoScenarioApplySchema>;
export type DemoScenarioApplyResponse = z.infer<typeof demoScenarioApplyResponseSchema>;
