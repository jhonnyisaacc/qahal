import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyTelegramInitData } from './telegramAuth';
import { createSignedInitData, TEST_BOT_TOKEN, TEST_NOW_MS } from '../test/telegramInitData';

describe('verifyTelegramInitData', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(TEST_NOW_MS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts valid signed init data and parses the Telegram user', async () => {
    const initData = await createSignedInitData();

    const result = await verifyTelegramInitData({
      initData,
      botToken: TEST_BOT_TOKEN,
      maxAgeSeconds: 300,
    });

    expect(result).toEqual({
      valid: true,
      user: {
        id: 321,
        first_name: 'Miriam',
        language_code: 'en',
        last_name: undefined,
        username: 'miriam321',
      },
    });
  });

  it('rejects expired init data', async () => {
    const initData = await createSignedInitData({
      authDate: Math.floor(TEST_NOW_MS / 1000) - 301,
    });

    const result = await verifyTelegramInitData({
      initData,
      botToken: TEST_BOT_TOKEN,
      maxAgeSeconds: 300,
    });

    expect(result).toEqual({
      valid: false,
      reason: 'init_data_expired',
    });
  });

  it('rejects an invalid hash', async () => {
    const params = new URLSearchParams(await createSignedInitData());
    params.set('hash', '0'.repeat(64));

    const result = await verifyTelegramInitData({
      initData: params.toString(),
      botToken: TEST_BOT_TOKEN,
      maxAgeSeconds: 300,
    });

    expect(result).toEqual({
      valid: false,
      reason: 'invalid_hash',
    });
  });
});
