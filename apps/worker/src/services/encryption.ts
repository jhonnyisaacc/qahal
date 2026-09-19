import type { Bindings } from '../types/env';
const encoder = new TextEncoder();
const encode = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
const decode = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
async function key(env: Bindings, id: string) {
  const keys = JSON.parse(env.DATA_KEYS ?? '{}') as Record<string, string>;
  const raw = keys[id] ? decode(keys[id]) : null;
  if (!raw || raw.length !== 32) throw new Error('encryption_key_unavailable');
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function encrypt(env: Bindings, context: string, value: unknown): Promise<string> {
  const id = env.DATA_KEY_ID;
  if (!id) throw new Error('encryption_key_unavailable');
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: encoder.encode(`v1:${id}:${context}`) },
    await key(env, id),
    encoder.encode(JSON.stringify(value)),
  );
  return JSON.stringify({
    v: 1,
    kid: id,
    nonce: encode(nonce),
    data: encode(new Uint8Array(ciphertext)),
  });
}
export async function decrypt<T>(env: Bindings, context: string, value: string): Promise<T> {
  const envelope = JSON.parse(value);
  if (envelope.v !== 1 || typeof envelope.kid !== 'string') throw new Error('invalid_ciphertext');
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: decode(envelope.nonce),
      additionalData: encoder.encode(`v1:${envelope.kid}:${context}`),
    },
    await key(env, envelope.kid),
    decode(envelope.data),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
export async function usernameIndex(env: Bindings, username: string): Promise<string> {
  const raw = decode(env.LOOKUP_KEY ?? '');
  if (raw.length !== 32) throw new Error('lookup_key_unavailable');
  const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const digest = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(username.trim().replace(/^@/, '').toLowerCase()),
  );
  return encode(new Uint8Array(digest));
}
