import type {
  AccessStatus,
  DiscoveryResponse,
  DiscoveryPreferences,
  CreateCommunity,
} from '@qahal/shared';
import type {
  CommunityManageResponse,
  CitySearchResponse,
  DemoScenarioApplyResponse,
  DemoScenarioDefinition,
  DemoScenarioId,
  DemoScenarioListResponse,
  EmunahState,
  LocationSave,
  MeetingSlotsUpsert,
  NearbyResponse,
  OnboardingSubmit,
} from '@qahal/shared';
import { env } from './env';
import { getTelegramWebApp } from './telegram';

export interface CommunityPerson {
  id: number;
  name: string;
  city: string;
  locationKey: string;
  badges: Array<{ kind: string; label: string; years?: number }>;
}

const baseUrl = env.apiBaseUrl.endsWith('/') ? env.apiBaseUrl.slice(0, -1) : env.apiBaseUrl;

const buildUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (path.startsWith('/api/') && baseUrl.endsWith('/api')) {
    return `${baseUrl}${path.slice(4)}`;
  }

  return `${baseUrl}${path}`;
};

const getTelegramAuthHeaders = (): Record<string, string> => {
  const initData = getTelegramWebApp()?.initData?.trim();
  if (!initData) {
    return {};
  }

  return {
    'X-Telegram-Init-Data': initData,
  };
};

const getJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    signal,
    headers: {
      ...getTelegramAuthHeaders(),
    },
  });
  if (!response.ok) {
    const failure = (await response
      .clone()
      .json()
      .catch(() => ({}))) as { error?: string };
    if (response.status === 401 || failure.error === 'admission_required')
      window.dispatchEvent(new Event('qahal:access-check'));
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const postJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getTelegramAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const failure = (await response
      .clone()
      .json()
      .catch(() => ({}))) as { error?: string };
    if (response.status === 401 || failure.error === 'admission_required')
      window.dispatchEvent(new Event('qahal:access-check'));
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const putJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getTelegramAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const failure = (await response
      .clone()
      .json()
      .catch(() => ({}))) as { error?: string };
    if (response.status === 401 || failure.error === 'admission_required')
      window.dispatchEvent(new Event('qahal:access-check'));
    throw new Error(`PUT ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const patchJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getTelegramAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const failure = (await response
      .clone()
      .json()
      .catch(() => ({}))) as { error?: string };
    if (response.status === 401 || failure.error === 'admission_required')
      window.dispatchEvent(new Event('qahal:access-check'));
    throw new Error(`PATCH ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const deleteJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: {
      ...getTelegramAuthHeaders(),
    },
  });

  if (!response.ok) {
    const failure = (await response
      .clone()
      .json()
      .catch(() => ({}))) as { error?: string };
    if (response.status === 401 || failure.error === 'admission_required')
      window.dispatchEvent(new Event('qahal:access-check'));
    throw new Error(`DELETE ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export interface UserApiProfile {
  telegramId: number;
  firstName?: string;
  city?: string;
  languageCode?: string;
  onboardingCompleted?: boolean;
  birthDate?: string;
  emunahState?: EmunahState;
  emunahLevelApproved?: boolean;
  badges?: string[];
  qahalName?: string;
  managedCommunityId?: number;
  canManageQahal?: boolean;
  canCreateQahal?: boolean;
  latestLatitude?: number;
  latestLongitude?: number;
}

export interface ManagedCommunity {
  communityId: number;
  communityName: string;
  city: string | null;
  type: 'in_person' | 'online';
  canManage: boolean;
  canCreateQahal: boolean;
  meetingSlots: Array<{
    id: number;
    weekday: number;
    timeMinutes: number;
  }>;
  members: Array<{
    telegramId: number;
    firstName: string | null;
    username: string | null;
  }>;
}

export interface TelegramVerifiedUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
}

export const api = {
  getMeeting: (id: number, telegramId: number) =>
    getJson<{ ok: true; link: string | null }>(
      `/communities/${id}/meeting?telegramId=${telegramId}`,
    ),
  setMeeting: (id: number, payload: { telegramId: number; link: string }) =>
    putJson<{ ok: true }>(`/communities/${id}/meeting`, payload),
  accessStatus: () => getJson<AccessStatus>('/access/status'),
  redeemCode: (code: string) => postJson<{ ok: true; admitted: true }>('/access/redeem', { code }),
  discovery: (params: URLSearchParams) => getJson<DiscoveryResponse>(`/discovery?${params}`),
  getDiscoveryPreferences: () => getJson<DiscoveryPreferences>('/discovery/preferences'),
  setDiscoveryPreferences: (payload: DiscoveryPreferences) =>
    putJson<{ ok: true }>('/discovery/preferences', payload),
  requestJoin: (id: number, telegramId: number) =>
    postJson<{ ok: true }>(`/communities/${id}/join`, { telegramId }),
  verifyTelegramInitData: (initData: string) => {
    return postJson<{ ok: boolean; user: TelegramVerifiedUser | null }>('/auth/telegram/verify', {
      initData,
    });
  },

  submitOnboarding: (payload: OnboardingSubmit) => {
    return postJson<{ ok: boolean; user?: UserApiProfile }>('/users/onboarding', payload);
  },

  getUser: (telegramId: number) => {
    return getJson<{ ok: boolean; user: UserApiProfile | null }>(`/users/${telegramId}`);
  },

  updateUserProfile: (
    telegramId: number,
    payload: { firstName?: string; birthDate?: string | null },
  ) => {
    return putJson<{ ok: boolean; user: UserApiProfile | null }>(
      `/users/${telegramId}/profile`,
      payload,
    );
  },

  resetLocalUser: (telegramId: number) => {
    return deleteJson<{ ok: boolean; reset: boolean }>(`/users/${telegramId}/local-reset`);
  },

  upsertLocation: (payload: {
    telegramId: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
  }) => {
    return postJson<{ ok: boolean }>('/locations', payload);
  },

  getNearby: (latitude: number, longitude: number, telegramId?: number) => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });
    if (typeof telegramId === 'number') {
      params.set('telegramId', String(telegramId));
    }
    return getJson<DiscoveryResponse>(`/discovery?${params.toString()}`).then((result) => ({
      ok: true as const,
      communities: result.communities.map((row) => ({
        ...row,
        city: row.city ?? '',
        distanceKm: row.distanceKm ?? 0,
      })),
    }));
  },

  getCommunityPeople: (params: { city?: string; latitude?: number; longitude?: number }) => {
    const search = new URLSearchParams();
    if (params.city) {
      search.set('city', params.city);
    }
    if (typeof params.latitude === 'number' && typeof params.longitude === 'number') {
      search.set('latitude', String(params.latitude));
      search.set('longitude', String(params.longitude));
    }

    return getJson<{ ok: boolean; people: CommunityPerson[] }>(
      `/communities/people?${search.toString()}`,
    );
  },

  createCommunity: (payload: CreateCommunity) => {
    return postJson<{
      ok: boolean;
      community: {
        id: number;
        name: string;
        city: string;
        canManage: boolean;
        canCreateQahal: boolean;
      };
    }>('/communities', payload);
  },

  getManagedCommunity: async (telegramId: number): Promise<ManagedCommunity> => {
    const params = new URLSearchParams({ telegramId: String(telegramId) });
    const response = await getJson<CommunityManageResponse>(
      `/communities/manage?${params.toString()}`,
    );

    return response.community;
  },

  renameCommunity: (communityId: number, payload: { telegramId: number; name: string }) => {
    return patchJson<{ ok: boolean }>(`/communities/${communityId}`, payload);
  },

  upsertMeetingSlots: (communityId: number, payload: MeetingSlotsUpsert) => {
    return putJson<{ ok: boolean }>(`/communities/${communityId}/meeting-slots`, payload);
  },

  addCommunityMemberByUsername: (
    communityId: number,
    payload: { telegramId: number; username: string },
  ) => {
    return postJson<{
      ok: boolean;
      member: {
        telegramId: number;
        firstName: string | null;
        username: string | null;
      };
    }>(`/communities/${communityId}/members/by-username`, payload);
  },

  listDemoScenarios: async (): Promise<DemoScenarioDefinition[]> => {
    const response = await getJson<DemoScenarioListResponse>('/users/demo-scenarios');
    return response.scenarios;
  },

  applyDemoScenario: (payload: { telegramId: number; scenarioId: DemoScenarioId }) => {
    return postJson<DemoScenarioApplyResponse>('/users/demo-scenarios/apply', payload);
  },

  searchCities: (
    query: string,
    signal?: AbortSignal,
    userLocation?: { latitude: number; longitude: number },
  ) => {
    const params = new URLSearchParams({ q: query });
    if (userLocation) {
      params.set('userLat', String(userLocation.latitude));
      params.set('userLng', String(userLocation.longitude));
    }
    return getJson<CitySearchResponse>(`/api/cities/search?${params.toString()}`, signal);
  },

  saveLocation: (payload: LocationSave) => {
    return postJson<{ ok: boolean }>('/api/location/save', payload);
  },
};
