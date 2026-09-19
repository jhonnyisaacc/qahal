import { DiscoveryPrivacy } from './DiscoveryPrivacy';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DemoScenarioDefinition, DemoScenarioId } from '@qahal/shared';
import { LOCAL_PROFILE_ROLE_OPTIONS, getLocalProfileRoleOption } from '../../app/types';
import type { LocalProfileRole } from '../../app/types';
import { getBadgeLocalized, useI18n } from '../../app/i18n';
import { api } from '../../lib/api';

interface ProfileScreenProps {
  telegramId: number;
  profileTestingEnabled: boolean;
  localProfileRole: LocalProfileRole;
  onRoleChange: (role: LocalProfileRole) => void;
  profileName: string;
  profileQahalName: string;
  profileBadges: string[];
  onProfileNameChange: (name: string) => void;
  confirmedBirthDate: string | null;
  onConfirmBirthDate: (birthDate: string | null) => void;
  onDemoScenarioApplied: () => void;
  canResetLocalData: boolean;
  onResetLocalData: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

const parseAgeValue = (value: string): number | null => {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 120) {
    return numeric;
  }

  // Backward compatibility for older stored date values.
  const parsedDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < parsedDate.getMonth() ||
    (today.getMonth() === parsedDate.getMonth() && today.getDate() < parsedDate.getDate());

  if (hasNotHadBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(0, Math.min(120, age));
};

const HomeIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21C9.552 21 10 20.552 10 20V16C10 15.448 10.448 15 11 15H13C13.552 15 14 15.448 14 16V20C14 20.552 14.448 21 15 21M9 21H15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14C8.134 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfileScreen = ({
  telegramId,
  profileTestingEnabled,
  localProfileRole,
  onRoleChange,
  profileName,
  profileQahalName,
  profileBadges,
  onProfileNameChange,
  confirmedBirthDate,
  onConfirmBirthDate,
  onDemoScenarioApplied,
  canResetLocalData,
  onResetLocalData,
  onGoHome,
  onGoMap,
}: ProfileScreenProps) => {
  const { t } = useI18n();
  const [birthDateDraft, setBirthDateDraft] = useState(() => {
    const parsed = confirmedBirthDate ? parseAgeValue(confirmedBirthDate) : null;
    return parsed === null ? '' : String(parsed);
  });
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const [demoScenarios, setDemoScenarios] = useState<DemoScenarioDefinition[]>([]);
  const [selectedDemoScenarioId, setSelectedDemoScenarioId] = useState<DemoScenarioId | ''>('');
  const [demoScenarioLoading, setDemoScenarioLoading] = useState(false);
  const [demoScenarioApplying, setDemoScenarioApplying] = useState(false);
  const [demoScenarioStatus, setDemoScenarioStatus] = useState<string | null>(null);
  const birthDateInputRef = useRef<HTMLSelectElement | null>(null);

  const roleOption = useMemo(() => getLocalProfileRoleOption(localProfileRole), [localProfileRole]);
  const roleDescriptions = useMemo(
    () => ({
      none: t.profile.roleNoneDesc,
      member: t.profile.roleMemberDesc,
      leader: t.profile.roleLeaderDesc,
    }),
    [t],
  );
  const computedAge = useMemo(() => parseAgeValue(birthDateDraft) ?? 0, [birthDateDraft]);
  const confirmedAge = useMemo(
    () => (confirmedBirthDate ? parseAgeValue(confirmedBirthDate) : null),
    [confirmedBirthDate],
  );
  const displayedQahalName = useMemo(() => {
    const fallbackQahal = getLocalProfileRoleOption('none').qahalName;
    if (profileQahalName === fallbackQahal) {
      return t.profile.roleNone;
    }
    return profileQahalName;
  }, [profileQahalName, t]);
  const selectedDemoScenario = useMemo(() => {
    return demoScenarios.find((scenario) => scenario.id === selectedDemoScenarioId) ?? null;
  }, [demoScenarios, selectedDemoScenarioId]);
  const canEditAge = confirmedBirthDate === null;
  const compactCardStyle = {
    borderRadius: 18,
    padding: '14px 16px',
    background: 'var(--theme-card-bg)',
    border: '1px solid var(--theme-card-border)',
    boxShadow: '0 4px 14px rgba(30, 24, 18, 0.04)',
  };
  const accentCardStyle = {
    ...compactCardStyle,
    border: '1px solid rgba(125, 90, 242, 0.14)',
  };
  const innerSurfaceStyle = {
    borderRadius: 14,
    padding: '12px 14px',
    background: 'var(--theme-bg-main)',
    border: '1px solid var(--theme-surface-warm-border)',
  };
  const neutralActionStyle = {
    height: 38,
    borderRadius: 10,
    border: '1px solid var(--theme-surface-warm-border)',
    background: 'transparent',
    color: 'var(--theme-text-primary)',
    fontSize: 12,
    fontWeight: 600,
  };

  useEffect(() => {
    if (!profileTestingEnabled) {
      setDemoScenarios([]);
      setSelectedDemoScenarioId('');
      setDemoScenarioStatus(null);
      return;
    }

    let cancelled = false;

    const loadDemoScenarios = async () => {
      setDemoScenarioLoading(true);
      try {
        const scenarios = await api.listDemoScenarios();
        if (cancelled) {
          return;
        }

        setDemoScenarios(scenarios);
        setSelectedDemoScenarioId((prev) => {
          if (prev && scenarios.some((scenario) => scenario.id === prev)) {
            return prev;
          }
          return scenarios[0]?.id ?? '';
        });
        setDemoScenarioStatus(null);
      } catch {
        if (!cancelled) {
          setDemoScenarios([]);
          setSelectedDemoScenarioId('');
          setDemoScenarioStatus(t.profile.demoScenariosLoadFailed);
        }
      } finally {
        if (!cancelled) {
          setDemoScenarioLoading(false);
        }
      }
    };

    void loadDemoScenarios();

    return () => {
      cancelled = true;
    };
  }, [profileTestingEnabled, t]);

  const openAgeConfirmation = () => {
    if (!birthDateDraft) {
      return;
    }

    setShowAgeConfirmation(true);
  };

  const confirmAgeSelection = () => {
    onConfirmBirthDate(birthDateDraft);
    setShowAgeConfirmation(false);
  };

  const triggerBirthDatePicker = () => {
    birthDateInputRef.current?.focus();
    birthDateInputRef.current?.click();
  };

  const applyDemoScenario = async () => {
    if (!selectedDemoScenarioId) {
      return;
    }

    setDemoScenarioApplying(true);
    setDemoScenarioStatus(null);
    try {
      await api.applyDemoScenario({
        telegramId,
        scenarioId: selectedDemoScenarioId,
      });
      onDemoScenarioApplied();
      setDemoScenarioStatus(t.profile.demoScenariosApplied);
    } catch {
      setDemoScenarioStatus(t.profile.demoScenariosApplyFailed);
    } finally {
      setDemoScenarioApplying(false);
    }
  };

  return (
    <section className="relative flex h-[100dvh] flex-col overflow-hidden">
      {/* Solid warm background (pure, no radial overlays) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-bg-main)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        <header className="flex items-center" style={{ padding: '60px 24px 12px 24px' }}>
          <h1
            className="qahal-display"
            style={{
              fontSize: 30,
              lineHeight: '36px',
              fontWeight: 700,
              color: 'var(--theme-text-primary)',
            }}
          >
            {t.profile.title}
          </h1>
        </header>
        <div className="px-6">
          <DiscoveryPrivacy />
        </div>

        <div className="flex flex-col gap-[12px] px-[24px]">
          <div className="flex items-center justify-between" style={compactCardStyle}>
            <div className="min-w-0">
              <div
                className="qahal-display text-sm tracking-[0.06em]"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {t.profile.name}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--theme-text-primary)',
                }}
              >
                {profileName}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextName = window.prompt(t.profile.editNamePrompt, profileName);
                if (typeof nextName === 'string' && nextName.trim()) {
                  onProfileNameChange(nextName.trim());
                }
              }}
              className="flex items-center justify-center px-3"
              style={{
                ...neutralActionStyle,
                color: 'var(--brand-accent)',
                border: '1px solid rgba(125, 90, 242, 0.14)',
              }}
            >
              {t.profile.edit}
            </button>
          </div>

          <div className="flex items-center justify-between" style={compactCardStyle}>
            <div>
              <div
                className="qahal-display text-sm tracking-[0.06em]"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {t.profile.qahal}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--theme-text-primary)',
                }}
              >
                {displayedQahalName}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3" style={compactCardStyle}>
            <div>
              <div
                className="qahal-display text-sm tracking-[0.06em]"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {t.profile.age}
              </div>
              {!canEditAge ? (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  {confirmedAge ?? 0}
                </div>
              ) : null}
            </div>
            {canEditAge ? (
              <div className="flex items-center gap-[8px]">
                <select
                  ref={birthDateInputRef}
                  value={birthDateDraft}
                  onChange={(event) => setBirthDateDraft(event.target.value)}
                  style={{
                    width: 82,
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid var(--theme-surface-warm-border)',
                    background: 'var(--theme-bg-main)',
                    fontSize: 13,
                    color: 'var(--theme-surface-warm-text)',
                    fontWeight: 700,
                    padding: '0 8px',
                  }}
                >
                  <option value="">{t.profile.agePlaceholder}</option>
                  {Array.from({ length: 121 }).map((_, age) => (
                    <option key={age} value={String(age)}>
                      {age}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openAgeConfirmation}
                  disabled={!birthDateDraft}
                  className="flex items-center justify-center px-3"
                  style={{
                    ...neutralActionStyle,
                    color: birthDateDraft ? 'var(--brand-accent)' : 'var(--theme-text-secondary)',
                    border: birthDateDraft
                      ? '1px solid rgba(125, 90, 242, 0.14)'
                      : '1px solid var(--theme-surface-warm-border)',
                  }}
                >
                  {t.profile.confirmAge}
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3" style={accentCardStyle}>
            <div
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: '0.06em',
                color: 'var(--theme-text-secondary)',
              }}
            >
              {t.profile.badges}
            </div>
            <div className="flex flex-wrap gap-2">
              {profileBadges.map((badgeName) => {
                const badge = getBadgeLocalized(t, badgeName);
                return (
                  <span
                    key={badge.name}
                    className="inline-flex items-center rounded-full"
                    style={{
                      padding: '6px 12px',
                      background: 'var(--theme-bg-main)',
                      border: '1px solid rgba(125, 90, 242, 0.16)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--brand-purple)',
                    }}
                  >
                    {badge.name}
                  </span>
                );
              })}
            </div>
          </div>

          {profileTestingEnabled ? (
            <>
              <div className="flex flex-col gap-3" style={accentCardStyle}>
                <div
                  className="qahal-display"
                  style={{ fontSize: 16, color: 'var(--theme-text-primary)', fontWeight: 600 }}
                >
                  {t.profile.testingRoleTitle}
                </div>
                <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
                  {t.profile.testingRoleBody}
                </p>
                <div style={innerSurfaceStyle}>
                  <select
                    value={localProfileRole}
                    onChange={(event) => onRoleChange(event.target.value as LocalProfileRole)}
                    className="w-full"
                    style={{
                      height: 38,
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 14,
                      color: 'var(--theme-text-primary)',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  >
                    {LOCAL_PROFILE_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value === 'none'
                          ? t.profile.roleNone
                          : option.value === 'member'
                            ? t.profile.roleMember
                            : t.profile.roleLeader}
                      </option>
                    ))}
                  </select>
                </div>
                <p style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>
                  {roleDescriptions[roleOption.value]}
                </p>
              </div>

              <div className="flex flex-col gap-3" style={accentCardStyle}>
                <div
                  className="qahal-display"
                  style={{ fontSize: 16, color: 'var(--theme-text-primary)', fontWeight: 600 }}
                >
                  {t.profile.demoScenariosTitle}
                </div>
                <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
                  {t.profile.demoScenariosBody}
                </p>
                <div style={innerSurfaceStyle}>
                  {demoScenarioLoading ? (
                    <div
                      style={{
                        minHeight: 38,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 14,
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      {t.profile.demoScenariosLoading}
                    </div>
                  ) : (
                    <select
                      value={selectedDemoScenarioId}
                      onChange={(event) =>
                        setSelectedDemoScenarioId(event.target.value as DemoScenarioId | '')
                      }
                      className="w-full"
                      style={{
                        height: 38,
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        fontSize: 14,
                        color: 'var(--theme-text-primary)',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      <option value="">{t.profile.demoScenariosPlaceholder}</option>
                      {demoScenarios.map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {selectedDemoScenario ? (
                  <p style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>
                    {selectedDemoScenario.description}
                  </p>
                ) : null}
                {demoScenarioStatus ? (
                  <p style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>
                    {demoScenarioStatus}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={applyDemoScenario}
                  disabled={demoScenarioLoading || demoScenarioApplying || !selectedDemoScenarioId}
                  className="flex items-center justify-center"
                  style={{
                    ...neutralActionStyle,
                    height: 40,
                    color:
                      demoScenarioLoading || demoScenarioApplying || !selectedDemoScenarioId
                        ? 'var(--theme-text-secondary)'
                        : 'var(--brand-accent)',
                    border: '1px solid rgba(125, 90, 242, 0.14)',
                    background: 'var(--theme-bg-main)',
                  }}
                >
                  {demoScenarioApplying
                    ? t.profile.demoScenariosApplying
                    : t.profile.demoScenariosApply}
                </button>
              </div>
            </>
          ) : null}

          {canResetLocalData ? (
            <div className="flex flex-col gap-3" style={accentCardStyle}>
              <div
                className="qahal-display"
                style={{ fontSize: 16, color: 'var(--theme-text-primary)', fontWeight: 600 }}
              >
                {t.profile.localDataTitle}
              </div>
              <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
                {t.profile.localDataBody}
              </p>
              <button
                type="button"
                onClick={onResetLocalData}
                className="flex items-center justify-center"
                style={{
                  ...neutralActionStyle,
                  height: 40,
                  color: 'var(--theme-surface-warm-muted-text)',
                  border: '1px solid rgba(125, 90, 242, 0.14)',
                  background: 'var(--theme-bg-main)',
                }}
              >
                {t.profile.localDataDelete}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showAgeConfirmation ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 px-[24px]">
          <div
            className="flex w-full max-w-[320px] flex-col gap-[12px]"
            style={{
              borderRadius: 20,
              padding: 20,
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
              boxShadow: 'var(--theme-card-shadow)',
            }}
          >
            <div
              className="qahal-display"
              style={{
                fontSize: 20,
                color: 'var(--theme-text-primary)',
                fontWeight: 700,
              }}
            >
              {t.profile.confirmAgeTitle}
            </div>
            <p
              style={{
                fontSize: 15,
                color: 'var(--theme-text-primary)',
                fontWeight: 700,
              }}
            >
              {t.profile.confirmAgeValue(computedAge)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--theme-surface-warm-muted-text)' }}>
              {t.profile.confirmAgeWarning}
            </p>

            <div className="flex gap-[8px] pt-[4px]">
              <button
                type="button"
                onClick={() => setShowAgeConfirmation(false)}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: '1px solid var(--theme-surface-warm-border)',
                  background: 'var(--theme-bg-main)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--theme-surface-warm-text)',
                }}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={confirmAgeSelection}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  background: 'var(--theme-button-primary-bg)',
                  boxShadow: 'var(--theme-button-primary-shadow)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{
          background: 'var(--theme-nav-bg)',
          borderTop: '1px solid var(--theme-card-border)',
          boxShadow: 'var(--theme-nav-shadow)',
          paddingBottom: 'calc(var(--safe-area-bottom) + 16px)',
          paddingTop: 20,
        }}
      >
        <div className="flex w-[327px] items-center justify-around py-[12px]">
          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
            onClick={onGoHome}
          >
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full">
              <HomeIcon color="var(--theme-accent)" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--theme-accent)',
                minHeight: 16,
                lineHeight: '16px',
              }}
            >
              {t.common.home}
            </span>
          </button>

          <button type="button" className="flex w-[84px] flex-col items-center gap-[4px]">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: 'var(--theme-accent)',
                boxShadow: 'var(--theme-button-primary-shadow)',
              }}
            >
              <ProfileIcon color="#F5F0E8" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--theme-accent)',
                minHeight: 16,
                lineHeight: '16px',
                visibility: 'hidden',
              }}
            >
              {t.common.profile}
            </span>
          </button>
        </div>
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 100,
            background: 'var(--theme-text-primary)',
            opacity: 0.2,
          }}
        />
      </div>
    </section>
  );
};
