import { expect, test } from '@playwright/test';

test('Telegram invitation opens list-only Home with local/online discovery', async ({ page }) => {
  let admitted = false;
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  await page.addInitScript(() => {
    (window as any).Telegram = {
      WebApp: {
        initData: 'test-fixture',
        initDataUnsafe: { user: { id: 321, language_code: 'en' } },
        colorScheme: 'light',
        ready: () => {},
        expand: () => {},
        onEvent: () => {},
        offEvent: () => {},
        safeAreaInset: { top: 20, bottom: 16 },
        contentSafeAreaInset: { top: 8, bottom: 0 },
        LocationManager: {
          init: (callback: () => void) => callback(),
          isLocationAvailable: true,
          getLocation: (callback: (location: null) => void) => callback(null),
        },
      },
    };
  });
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown;
    if (url.pathname === '/api/access/status')
      body = { ok: true, telegramId: 321, gateEnabled: true, admitted };
    else if (url.pathname === '/api/access/redeem') {
      admitted = true;
      body = { ok: true, admitted: true };
    } else if (url.pathname === '/api/auth/telegram/verify')
      body = { ok: true, user: { telegramId: 321, languageCode: 'en' } };
    else if (url.pathname === '/api/users/321')
      body = {
        ok: true,
        user: {
          telegramId: 321,
          firstName: 'Miriam',
          city: 'Paris',
          onboardingCompleted: true,
          latestLatitude: 48.85,
          latestLongitude: 2.35,
          canCreateQahal: false,
          canManageQahal: false,
        },
      };
    else if (url.pathname === '/api/discovery')
      body =
        url.searchParams.get('type') === 'online'
          ? {
              ok: true,
              communities: [
                {
                  id: 2,
                  name: 'Qahal Online',
                  type: 'online',
                  city: null,
                  distanceKm: null,
                  memberState: 'requested',
                  canManage: false,
                },
              ],
              people: [],
              nextPage: null,
            }
          : {
              ok: true,
              communities: [],
              people: [{ id: 3, name: 'David', area: 'Paris', contactUrl: null }],
              nextPage: null,
            };
    else if (url.pathname === '/api/discovery/preferences')
      body = { discoverable: false, contactVisible: false };
    else if (url.pathname === '/api/cities/search') body = { ok: true, suggestions: [] };
    else {
      await route.fulfill({ status: 404, json: { ok: false, error: 'unknown_fixture_route' } });
      return;
    }
    await route.fulfill({ json: body });
  });
  await page.goto('/');
  await expect(page.getByLabel('Access code')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Local' })).toHaveCount(0);
  await page.getByLabel('Access code').fill('EXAMPLE-CODE');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Local' })).toBeVisible();
  await expect(page.getByText('David', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use my location', exact: true }).click();
  await expect(page.getByText('Location unavailable. Choose a city instead.')).toBeVisible();
  await page.getByRole('tab', { name: 'Online', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Qahal Online' })).toBeVisible();
  await expect(page.locator('.leaflet-container')).toHaveCount(0);
  await expect(page.locator('img')).toHaveCount(0);
  await page.screenshot({ path: '/tmp/qahal-redesign-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.screenshot({ path: '/tmp/qahal-redesign-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await expect(page.getByText('Discovery privacy', { exact: true })).toBeVisible();
});
