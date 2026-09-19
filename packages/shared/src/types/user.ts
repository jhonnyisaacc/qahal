import type { EmunahState } from '../schemas/app';

export interface UserDto {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  city?: string;
  onboardingCompleted?: boolean;
  birthDate?: string;
  emunahState?: EmunahState;
  emunahLevelApproved?: boolean;
  badges?: string[];
  qahalName?: string;
  latestLatitude?: number;
  latestLongitude?: number;
}
