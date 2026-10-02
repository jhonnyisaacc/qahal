import { describe, expect, it } from 'vitest';
import { citySearchQuerySchema, meetingSlotsUpsertSchema, onboardingSubmitSchema } from './app';

describe('onboardingSubmitSchema', () => {
  it('defaults the language code to English', () => {
    const parsed = onboardingSubmitSchema.parse({
      telegramId: 123,
      firstName: 'Miriam',
    });

    expect(parsed.languageCode).toBe('en');
  });

  it('rejects a blank first name', () => {
    const parsed = onboardingSubmitSchema.safeParse({
      telegramId: 123,
      firstName: '',
    });

    expect(parsed.success).toBe(false);
  });
});

describe('citySearchQuerySchema', () => {
  it('requires userLat and userLng together', () => {
    const parsed = citySearchQuerySchema.safeParse({
      q: 'Jerusalem',
      userLat: 31.7683,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('meetingSlotsUpsertSchema', () => {
  it('rejects more than 24 meeting slots', () => {
    const parsed = meetingSlotsUpsertSchema.safeParse({
      telegramId: 123,
      slots: Array.from({ length: 25 }, (_, index) => ({
        weekday: index % 7,
        timeMinutes: index * 10,
      })),
    });

    expect(parsed.success).toBe(false);
  });
});
