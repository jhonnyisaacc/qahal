import type { ExecutionContext } from '@cloudflare/workers-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../index';
import type { Bindings } from '../types/env';
import { createSignedInitData, TEST_BOT_TOKEN, TEST_NOW_MS } from '../test/telegramInitData';

const createExecutionContext = (): ExecutionContext => {
  return {
    passThroughOnException: vi.fn(),
    waitUntil: vi.fn(),
  } as unknown as ExecutionContext;
};

describe('authRoute', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(TEST_NOW_MS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 for an invalid payload', async () => {
    const response = await app.fetch(
      new Request('https://qahal.test/api/auth/telegram/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
      {
        DB: undefined,
        INITDATA_MAX_AGE_SECONDS: '300',
      } satisfies Bindings,
      createExecutionContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'invalid_payload',
    });
  });

  it('returns the mapped user when the payload verifies', async () => {
    const response = await app.fetch(
      new Request('https://qahal.test/api/auth/telegram/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: await createSignedInitData(),
        }),
      }),
      {
        DB: undefined,
        TELEGRAM_BOT_TOKEN: TEST_BOT_TOKEN,
        INITDATA_MAX_AGE_SECONDS: '300',
      } satisfies Bindings,
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      user: {
        telegramId: 321,
        username: 'miriam321',
        firstName: 'Miriam',
        lastName: undefined,
        languageCode: 'en',
      },
    });
  });
});
