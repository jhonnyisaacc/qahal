export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
};

const TEST_HOST_HINTS = ['test', 'testing', 'staging', 'preview', 'dev'];

export const isProfileTestingEnabled = (): boolean => {
  const flag = String(import.meta.env.VITE_ENABLE_PROFILE_TESTING ?? '').toLowerCase() === 'true';
  const host = window.location.hostname.toLowerCase();
  const localHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  return import.meta.env.DEV && flag && localHost;
};
