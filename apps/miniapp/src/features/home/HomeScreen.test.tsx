import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from './HomeScreen';
import { I18nProvider } from '../../app/i18n';
import { api } from '../../lib/api';
vi.mock('../../lib/api', () => ({ api: { discovery: vi.fn() } }));
vi.mock('../onboarding/CitySearch', () => ({ CitySearch: () => <div>City selector</div> }));
function home() {
  return render(
    <I18nProvider languageCode="en" onLanguageCodeChange={() => {}}>
      <HomeScreen
        telegramId={1}
        city="Test"
        latitude={0}
        longitude={0}
        onAreaChange={() => {}}
        variant="default"
        communities={[]}
        onVariantChange={() => {}}
        onGoMap={() => {}}
        onGoProfile={() => {}}
        onGoManageQahal={() => {}}
        profileTestingEnabled={false}
        effectiveProfile={{
          displayName: 'Test',
          qahalName: '',
          badges: [],
          hasCongregation: false,
          canCreateQahal: false,
          canManageQahal: false,
          managedCommunityId: null,
          emunahLevelApproved: true,
        }}
      />
    </I18nProvider>,
  );
}
describe('list discovery', () => {
  it('shows opted-in people on an empty Local result and uses a separate Online query', async () => {
    vi.mocked(api.discovery)
      .mockResolvedValueOnce({
        ok: true,
        communities: [],
        people: [{ id: 2, name: 'Miriam', area: 'Test', contactUrl: null }],
        nextPage: null,
      })
      .mockResolvedValueOnce({
        ok: true,
        communities: [
          {
            id: 3,
            name: 'Online Qahal',
            city: null,
            type: 'online',
            distanceKm: null,
            memberState: 'requested',
            canManage: false,
          },
        ],
        people: [],
        nextPage: null,
      });
    const { container } = home();
    expect(await screen.findByText('Miriam')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Online' }));
    expect(await screen.findByText('Online Qahal')).toBeInTheDocument();
    expect(screen.queryByText('Miriam')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('Map')).not.toBeInTheDocument();
  });
  it('shows a retry state rather than an empty-result fallback on failure', async () => {
    vi.mocked(api.discovery).mockRejectedValue(new Error('offline'));
    home();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load results');
    expect(screen.queryByText(/No Qahal in this area/)).not.toBeInTheDocument();
  });
});
