import { z } from 'zod';

export const accessStatusSchema = z.object({
  ok: z.literal(true),
  telegramId: z.number().int().positive(),
  gateEnabled: z.boolean(),
  admitted: z.boolean(),
});
export const redeemCodeSchema = z.object({ code: z.string().trim().min(1).max(128) });
export const communityTypeSchema = z.enum(['in_person', 'online']);
export const discoveryQuerySchema = z
  .object({
    type: communityTypeSchema.default('in_person'),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce
      .number()
      .refine((v) => [10, 25, 50, 100].includes(v))
      .default(25),
    page: z.coerce.number().int().min(0).max(10000).default(0),
  })
  .refine((v) => v.type === 'online' || (v.latitude !== undefined && v.longitude !== undefined), {
    message: 'Local discovery requires an area',
  });
export const discoveryPreferencesSchema = z.object({
  discoverable: z.boolean(),
  contactVisible: z.boolean(),
});
export const discoveryCommunitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  city: z.string().nullable(),
  type: communityTypeSchema,
  distanceKm: z.number().nullable(),
  memberState: z.enum(['not_member', 'requested', 'member']),
  canManage: z.boolean(),
});
export const discoveryPersonSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  area: z.string(),
  contactUrl: z.string().nullable(),
});
export const discoveryResponseSchema = z.object({
  ok: z.literal(true),
  communities: z.array(discoveryCommunitySchema),
  people: z.array(discoveryPersonSchema),
  nextPage: z.number().nullable(),
});
export type AccessStatus = z.infer<typeof accessStatusSchema>;
export type DiscoveryResponse = z.infer<typeof discoveryResponseSchema>;
export type DiscoveryPreferences = z.infer<typeof discoveryPreferencesSchema>;
export const meetingLinkSchema = z.object({
  telegramId: z.number().int().positive(),
  link: z
    .string()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password;
      } catch {
        return false;
      }
    }),
});
export const membershipRequestSchema = z.object({ telegramId: z.number().int().positive() });
