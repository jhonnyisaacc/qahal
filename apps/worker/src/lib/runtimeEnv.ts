import type { Context } from 'hono';
import type { Bindings } from '../types/env';

const PRODUCTION_VALUES = new Set(['prod', 'production']);

const isLocalHost = (hostname: string): boolean => {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
};

export const isProductionRequest = (c: Context<{ Bindings: Bindings }>): boolean => {
  const configured = String(c.env.APP_ENV ?? '')
    .trim()
    .toLowerCase();

  const hostname = new URL(c.req.url).hostname.toLowerCase();
  return !(isLocalHost(hostname) && ['development', 'local', 'test'].includes(configured));
};
