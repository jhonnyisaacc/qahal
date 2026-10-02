import type { D1Database } from '@cloudflare/workers-types';
export function database(value: unknown): D1Database {
  if (!value || typeof value !== 'object' || !('prepare' in value)) {
    throw new Error('database_unavailable');
  }
  return value as D1Database;
}
