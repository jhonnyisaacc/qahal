import type { EmunahState } from "@qahal/shared";

export type RootScreen =
  | "onboarding-carousel"
  | "onboarding-state"
  | "onboarding-questions"
  | "onboarding-data"
  | "map"
  | "home"
  | "manage-qahal"
  | "profile";

export type MapVariant = "allowed" | "selected" | "no-permission";

export type HomeVariant =
  | "default"
  | "already-member"
  | "already-requested"
  | "join-requested"
  | "qahal-exists";

export type LocalProfileRole = "none" | "member" | "leader";

export interface LocalProfileRoleOption {
  value: LocalProfileRole;
  label: string;
  description: string;
  defaultDisplayName: string;
  qahalName: string;
  badges: string[];
}

export interface BadgeDefinition {
  kind:
    | "emunah"
    | "kehilah"
    | "years"
    | "messenger"
    | "hebrew-teacher"
    | "hebrew-student"
    | "generic";
  name: string;
  desc: string;
  years?: number;
}

export interface EffectiveProfileSnapshot {
  displayName: string;
  qahalName: string;
  badges: string[];
  hasCongregation: boolean;
  canCreateQahal: boolean;
  canManageQahal: boolean;
  managedCommunityId: number | null;
  emunahState?: EmunahState;
  emunahLevelApproved: boolean;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  Emunah: {
    kind: "emunah",
    name: "Emunah",
    desc: "Granted after answering all onboarding doctrine questions with yes.",
  },
  Kehilah: {
    kind: "kehilah",
    name: "Kehilah",
    desc: "Granted when the person belongs to a congregation.",
  },
  Messenger: {
    kind: "messenger",
    name: "Messenger",
    desc: "Granted to leaders serving a congregation.",
  },
  "Hebrew Teacher": {
    kind: "hebrew-teacher",
    name: "Hebrew Teacher",
    desc: "For members committed to teaching Hebrew.",
  },
  "Hebrew Student": {
    kind: "hebrew-student",
    name: "Hebrew Student",
    desc: "For members committed to learning Hebrew.",
  },
};

export const resolveBadgeDefinition = (badgeName: string): BadgeDefinition => {
  const yearsMatch = badgeName.match(/^Years in Emunah\s*(?:\((\d+)\)|:\s*(\d+))$/i);
  if (yearsMatch) {
    const years = Number(yearsMatch[1] ?? yearsMatch[2] ?? 0);
    return {
      kind: "years",
      name: `Years in Emunah (${Number.isFinite(years) ? years : 0})`,
      desc: "Years actively walking in Emunah while using the app.",
      years: Number.isFinite(years) ? years : 0,
    };
  }

  return (
    BADGE_DEFINITIONS[badgeName] ?? {
      kind: "generic",
      name: badgeName,
      desc: "Badge earned through community faithfulness",
    }
  );
};

export const LOCAL_PROFILE_ROLE_OPTIONS: LocalProfileRoleOption[] = [
  {
    value: "none",
    label: "No Congregation Yet",
    description: "Can request to join a congregation.",
    defaultDisplayName: "New Pilgrim",
    qahalName: "No congregation yet",
    badges: [],
  },
  {
    value: "member",
    label: "Member",
    description: "Already belongs to one congregation.",
    defaultDisplayName: "Ezra Cohen",
    qahalName: "Jerusalem Harbor Qahal",
    badges: ["Kehilah"],
  },
  {
    value: "leader",
    label: "Community Leader",
    description: "Leader of a congregation (member state).",
    defaultDisplayName: "Miriam Levi",
    qahalName: "Jerusalem Harbor Qahal",
    badges: ["Kehilah", "Messenger"],
  },
];

export const getLocalProfileRoleOption = (
  role: LocalProfileRole,
): LocalProfileRoleOption => {
  const matched = LOCAL_PROFILE_ROLE_OPTIONS.find(
    (option) => option.value === role,
  );
  if (matched) {
    return matched;
  }

  return {
    value: "none",
    label: "No Congregation Yet",
    description: "Can request to join a congregation.",
    defaultDisplayName: "New Pilgrim",
    qahalName: "No congregation yet",
    badges: [],
  };
};

export interface OnboardingAnswers {
  values: Record<number, string>;
  firstName: string;
  city: string;
  cityLatitude?: number;
  cityLongitude?: number;
  languageCode: "en" | "es" | "he";
  emunahState?: EmunahState;
}

export interface AppFlowState {
  screen: RootScreen;
  questionStep: number;
  answers: OnboardingAnswers;
  mapVariant: MapVariant;
  homeVariant: HomeVariant;
  telegramId: number;
}
