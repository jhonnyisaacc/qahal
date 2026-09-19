import { describe, expect, it } from 'vitest';
import { telegramVerifyRequestSchema } from './telegram';

describe('telegramVerifyRequestSchema', () => {
  it('accepts non-empty init data', () => {
    const parsed = telegramVerifyRequestSchema.safeParse({
      initData: 'query_id=abc123',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects empty init data', () => {
    const parsed = telegramVerifyRequestSchema.safeParse({
      initData: '',
    });

    expect(parsed.success).toBe(false);
  });
});
