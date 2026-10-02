import { describe, expect, it } from 'vitest';
import { discoveryQuerySchema, meetingLinkSchema } from './redesign';
import { createCommunitySchema } from './app';
describe('redesign contracts', () => {
  it('requires areas only for in-person communities and Local discovery', () => {
    expect(
      createCommunitySchema.safeParse({ telegramId: 1, name: 'Online', type: 'online' }).success,
    ).toBe(true);
    expect(
      createCommunitySchema.safeParse({ telegramId: 1, name: 'Local', type: 'in_person' }).success,
    ).toBe(false);
    expect(discoveryQuerySchema.safeParse({ type: 'online' }).success).toBe(true);
    expect(discoveryQuerySchema.safeParse({ latitude: 0 }).success).toBe(false);
    expect(discoveryQuerySchema.parse({ latitude: 0, longitude: 0 }).radiusKm).toBe(25);
    expect(
      discoveryQuerySchema.safeParse({ latitude: 0, longitude: 0, radiusKm: 999 }).success,
    ).toBe(false);
  });
  it('rejects unsafe meeting URLs', () => {
    expect(
      meetingLinkSchema.safeParse({ telegramId: 1, link: 'javascript:alert(1)' }).success,
    ).toBe(false);
    expect(
      meetingLinkSchema.safeParse({ telegramId: 1, link: 'https://user:pass@example.org' }).success,
    ).toBe(false);
    expect(
      meetingLinkSchema.safeParse({ telegramId: 1, link: 'https://example.org/meeting' }).success,
    ).toBe(true);
  });
});
