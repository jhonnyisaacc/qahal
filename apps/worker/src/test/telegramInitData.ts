const encoder = new TextEncoder();

export const TEST_BOT_TOKEN = '123456:ABCDEF';
export const TEST_NOW_MS = Date.UTC(2026, 4, 24, 12, 0, 0);

const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
};

const hmacSha256 = async (keyBytes: Uint8Array, message: string): Promise<Uint8Array> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(keyBytes),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return new Uint8Array(signature);
};

export const createSignedInitData = async (options?: {
  authDate?: number;
  user?: Record<string, unknown>;
  extraParams?: Record<string, string>;
}): Promise<string> => {
  const params = new URLSearchParams();
  const authDate = options?.authDate ?? Math.floor(TEST_NOW_MS / 1000);

  params.set('auth_date', String(authDate));
  params.set('query_id', 'AAHdF6IQAAAAAN0XohDhrOrc');
  params.set(
    'user',
    JSON.stringify(
      options?.user ?? {
        id: 321,
        first_name: 'Miriam',
        username: 'miriam321',
        language_code: 'en',
      },
    ),
  );

  for (const [key, value] of Object.entries(options?.extraParams ?? {})) {
    params.set(key, value);
  }

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await hmacSha256(encoder.encode('WebAppData'), TEST_BOT_TOKEN);
  const hash = toHex(await hmacSha256(secretKey, dataCheckString));

  params.set('hash', hash);
  return params.toString();
};
