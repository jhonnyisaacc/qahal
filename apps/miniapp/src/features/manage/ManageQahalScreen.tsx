import { MeetingLink } from './MeetingLink';
import { useEffect, useMemo, useState } from 'react';
import type { ManagedCommunity } from '../../lib/api';
import { api } from '../../lib/api';
import { useI18n } from '../../app/i18n';

interface ManageQahalScreenProps {
  telegramId: number;
  managedCommunityId: number | null;
  managedCommunity: ManagedCommunity | null;
  profileTestingEnabled: boolean;
  canManageQahal: boolean;
  onGoHome: () => void;
  onGoMap: () => void;
  onGoProfile: () => void;
}

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

const dayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const toTimeMinutes = (value: string): number => {
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }
  return Math.max(0, Math.min(1439, hours * 60 + minutes));
};

const formatMinutes = (value: number): string => {
  const safe = Math.max(0, Math.min(1439, value));
  const hours = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (safe % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const ManageQahalScreen = ({
  telegramId,
  managedCommunityId,
  managedCommunity,
  profileTestingEnabled,
  canManageQahal,
  onGoHome,
  onGoMap,
  onGoProfile,
}: ManageQahalScreenProps) => {
  const { t } = useI18n();
  const [isEditingName, setIsEditingName] = useState(false);
  const [localCommunityName, setLocalCommunityName] = useState(
    managedCommunity?.communityName ?? '',
  );
  const [meetingSlots, setMeetingSlots] = useState(managedCommunity?.meetingSlots ?? []);
  const [members, setMembers] = useState(managedCommunity?.members ?? []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showWeekdaySelector, setShowWeekdaySelector] = useState(false);
  const [pendingWeekday, setPendingWeekday] = useState<number>(1);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [timeDraft, setTimeDraft] = useState('19:00');

  const currentCommunityId = managedCommunity?.communityId ?? managedCommunityId;
  const hasBackendCommunity = typeof currentCommunityId === 'number';
  const hasAccess = canManageQahal || profileTestingEnabled;
  const compactCardStyle = {
    borderRadius: 18,
    padding: '16px 18px',
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
  const compactCircleButtonStyle = {
    width: 30,
    height: 30,
    borderRadius: 999,
    border: '1px solid rgba(125, 90, 242, 0.14)',
    background: 'transparent',
    color: 'var(--theme-accent)',
  };
  const secondaryActionStyle = {
    height: 38,
    borderRadius: 10,
    border: '1px solid var(--theme-surface-warm-border)',
    background: 'transparent',
    color: 'var(--theme-text-primary)',
    fontSize: 12,
    fontWeight: 600,
  };
  const primaryActionStyle = {
    height: 38,
    borderRadius: 10,
    border: '1px solid var(--theme-button-primary-border)',
    background: 'var(--theme-button-primary-bg)',
    color: 'var(--theme-button-primary-text)',
    fontSize: 12,
    fontWeight: 600,
    boxShadow: 'var(--theme-button-primary-shadow)',
  };

  const sortedSlots = useMemo(() => {
    return [...meetingSlots].sort((a, b) => {
      if (a.weekday !== b.weekday) {
        return a.weekday - b.weekday;
      }
      return a.timeMinutes - b.timeMinutes;
    });
  }, [meetingSlots]);

  const loadCommunity = async () => {
    if (!hasBackendCommunity) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const response = await api.getManagedCommunity(telegramId);
      setLocalCommunityName(response.communityName);
      setMeetingSlots(response.meetingSlots);
      setMembers(response.members);
    } catch {
      setStatusMessage(t.manageQahal.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalCommunityName(managedCommunity?.communityName ?? '');
    setMeetingSlots(managedCommunity?.meetingSlots ?? []);
    setMembers(managedCommunity?.members ?? []);
  }, [managedCommunity]);

  useEffect(() => {
    if (managedCommunity || !hasBackendCommunity) {
      return;
    }
    void loadCommunity();
  }, [managedCommunity, hasBackendCommunity]);

  const persistMeetingSlots = async (
    nextSlots: Array<{ id: number; weekday: number; timeMinutes: number }>,
  ) => {
    setMeetingSlots(nextSlots);

    if (!hasBackendCommunity) {
      setStatusMessage(t.manageQahal.localFallbackHint);
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      await api.upsertMeetingSlots(currentCommunityId, {
        telegramId,
        slots: nextSlots
          .slice()
          .sort((a, b) =>
            a.weekday === b.weekday ? a.timeMinutes - b.timeMinutes : a.weekday - b.weekday,
          )
          .map((slot) => ({
            weekday: slot.weekday,
            timeMinutes: slot.timeMinutes,
          })),
      });
      await loadCommunity();
      setStatusMessage(t.common.done);
    } catch {
      setStatusMessage(t.manageQahal.loadFailed);
    } finally {
      setSaving(false);
    }
  };

  const startMeetingSlotSelector = () => {
    setPendingWeekday(1);
    setTimeDraft('19:00');
    setShowWeekdaySelector(true);
    setShowTimeSelector(false);
  };

  const proceedToTimePicker = (weekday: number) => {
    setPendingWeekday(weekday);
    setShowWeekdaySelector(false);
    setShowTimeSelector(true);
  };

  const addSlotFromSelections = async () => {
    const value = timeDraft;

    const timeMinutes = toTimeMinutes(value);
    const normalizedTime = formatMinutes(timeMinutes);
    const validPattern = /^\d{2}:\d{2}$/;
    if (!validPattern.test(value.trim()) || normalizedTime !== value.trim()) {
      setStatusMessage(t.manageQahal.invalidTimeFormat);
      return;
    }

    const exists = meetingSlots.some(
      (slot) => slot.weekday === pendingWeekday && slot.timeMinutes === timeMinutes,
    );
    if (exists) {
      setStatusMessage(t.common.done);
      setShowTimeSelector(false);
      return;
    }

    const nextSlots = [
      ...meetingSlots,
      {
        id: Date.now(),
        weekday: pendingWeekday,
        timeMinutes,
      },
    ];
    setShowTimeSelector(false);
    await persistMeetingSlots(nextSlots);
  };

  const removeSlot = async (id: number) => {
    const nextSlots = meetingSlots.filter((slot) => slot.id !== id);
    await persistMeetingSlots(nextSlots);
  };

  const saveName = async () => {
    if (!localCommunityName.trim() || !hasBackendCommunity) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      await api.renameCommunity(currentCommunityId, {
        telegramId,
        name: localCommunityName.trim(),
      });
      setStatusMessage(t.common.done);
      await loadCommunity();
    } catch {
      setStatusMessage(t.manageQahal.loadFailed);
    } finally {
      setSaving(false);
    }
  };

  const promptAddMember = async () => {
    const usernameAnswer = window.prompt('Enter Telegram username', '');
    if (usernameAnswer === null) {
      return;
    }

    const normalized = usernameAnswer.trim().replace(/^@/, '');
    if (!normalized) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    if (!hasBackendCommunity) {
      setMembers((prev) => [
        ...prev,
        {
          telegramId: Date.now(),
          firstName: null,
          username: normalized,
        },
      ]);
      setSaving(false);
      setStatusMessage(t.manageQahal.localFallbackHint);
      return;
    }

    try {
      await api.addCommunityMemberByUsername(currentCommunityId, {
        telegramId,
        username: normalized,
      });
      setStatusMessage(t.common.done);
      await loadCommunity();
    } catch {
      setStatusMessage(t.manageQahal.loadFailed);
    } finally {
      setSaving(false);
    }
  };

  const PencilIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5A2.121 2.121 0 0 1 19.5 6.5L7 19H4V16L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const BackArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <section className="relative flex h-[100dvh] flex-col overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'var(--theme-bg-main)' }} />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        <header className="flex items-center gap-[10px]" style={{ padding: '60px 24px 12px 24px' }}>
          <button
            type="button"
            onClick={onGoHome}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--brand-purple)33] bg-transparent text-[var(--theme-text-primary)]"
            aria-label={t.common.back}
          >
            <BackArrowIcon />
          </button>
          <h1
            className="qahal-display"
            style={{
              fontSize: 30,
              lineHeight: '36px',
              fontWeight: 700,
              color: 'var(--theme-text-primary)',
            }}
          >
            {t.manageQahal.title}
          </h1>
        </header>
        {hasAccess && currentCommunityId && (
          <div className="px-6">
            <MeetingLink communityId={currentCommunityId} telegramId={telegramId} editable />
          </div>
        )}

        <div className="flex flex-col gap-[12px] px-[24px]">
          <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
            {t.manageQahal.subtitle}
          </p>

          {!hasAccess ? (
            <div
              style={{
                ...compactCardStyle,
                border: '1px solid rgba(124, 45, 18, 0.16)',
                color: '#7C2D12',
                fontSize: 14,
              }}
            >
              {t.manageQahal.notLeader}
            </div>
          ) : null}

          {hasAccess ? (
            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[12px]" style={accentCardStyle}>
                <div className="flex items-center justify-between">
                  <label
                    className="qahal-display"
                    style={{
                      fontSize: 14,
                      letterSpacing: '0.06em',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {t.manageQahal.communityNameLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingName((prev) => !prev)}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[var(--brand-purple)33] bg-transparent text-[var(--theme-accent)]"
                    aria-label={t.profile.edit}
                  >
                    <PencilIcon />
                  </button>
                </div>

                {isEditingName ? (
                  <div className="flex gap-[10px]">
                    <input
                      value={localCommunityName}
                      onChange={(event) => setLocalCommunityName(event.target.value)}
                      placeholder={t.manageQahal.communityNamePlaceholder}
                      className="h-[40px] flex-1 rounded-[10px] border border-[var(--brand-purple)33] bg-transparent px-[10px] text-[14px] text-[var(--theme-text-primary)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void saveName();
                      }}
                      disabled={saving || !hasBackendCommunity}
                      className="h-[40px] rounded-[10px] px-[12px] text-[12px] font-semibold text-white"
                      style={{
                        background:
                          saving || !hasBackendCommunity
                            ? '#9CA3AF'
                            : 'var(--theme-button-primary-bg)',
                        boxShadow:
                          saving || !hasBackendCommunity
                            ? 'none'
                            : 'var(--theme-button-primary-shadow)',
                      }}
                    >
                      {t.manageQahal.saveName}
                    </button>
                  </div>
                ) : (
                  <div style={innerSurfaceStyle}>
                    <p
                      style={{ fontSize: 17, fontWeight: 700, color: 'var(--theme-text-primary)' }}
                    >
                      {localCommunityName || t.manageQahal.communityNamePlaceholder}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-[12px]" style={compactCardStyle}>
                <div className="flex items-center justify-between">
                  <h2
                    className="qahal-display"
                    style={{
                      fontSize: 14,
                      letterSpacing: '0.06em',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {t.manageQahal.meetingTimesTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      startMeetingSlotSelector();
                    }}
                    className="flex items-center justify-center"
                    style={compactCircleButtonStyle}
                    aria-label={t.manageQahal.addSlot}
                  >
                    +
                  </button>
                </div>

                {showWeekdaySelector ? (
                  <div className="flex items-center gap-[8px]" style={innerSurfaceStyle}>
                    <select
                      value={pendingWeekday}
                      onChange={(event) => {
                        const selected = Number(event.target.value);
                        if (Number.isInteger(selected) && selected >= 0 && selected <= 6) {
                          setPendingWeekday(selected);
                        }
                      }}
                      className="h-[38px] rounded-[10px] px-[10px] text-[13px] text-[var(--theme-text-primary)] outline-none"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid var(--theme-surface-warm-border)',
                      }}
                      aria-label={t.manageQahal.dayLabel}
                    >
                      {dayOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => proceedToTimePicker(pendingWeekday)}
                      className="px-[12px]"
                      style={primaryActionStyle}
                    >
                      {t.common.continue}
                    </button>
                  </div>
                ) : null}

                {showTimeSelector ? (
                  <div className="flex items-center gap-[8px]" style={innerSurfaceStyle}>
                    <input
                      type="time"
                      value={timeDraft}
                      onChange={(event) => setTimeDraft(event.target.value)}
                      className="h-[38px] rounded-[10px] px-[10px] text-[13px] text-[var(--theme-text-primary)] outline-none"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid var(--theme-surface-warm-border)',
                      }}
                      aria-label={t.manageQahal.timeLabel}
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void addSlotFromSelections();
                      }}
                      className="px-[12px]"
                      style={primaryActionStyle}
                    >
                      {t.manageQahal.addSlot}
                    </button>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-[8px]">
                  {sortedSlots.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>Not set</p>
                  ) : (
                    sortedSlots.map((slot) => {
                      const dayLabel =
                        dayOptions.find((option) => option.value === slot.weekday)?.label ?? '?';
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            void removeSlot(slot.id);
                          }}
                          className="rounded-full px-[10px] py-[6px] text-[12px]"
                          style={{
                            background: 'var(--theme-bg-main)',
                            border: '1px solid rgba(125, 90, 242, 0.14)',
                            color: 'var(--brand-accent)',
                          }}
                        >
                          {dayLabel} {formatMinutes(slot.timeMinutes)} x
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-[12px]" style={compactCardStyle}>
                <div className="flex items-center justify-between">
                  <h2
                    className="qahal-display"
                    style={{
                      fontSize: 14,
                      letterSpacing: '0.06em',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {t.manageQahal.membersTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      void promptAddMember();
                    }}
                    className="flex items-center justify-center"
                    style={compactCircleButtonStyle}
                    aria-label={t.manageQahal.addMember}
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col gap-[8px]">
                  {members.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
                      {t.manageQahal.noMembers}
                    </p>
                  ) : (
                    members.map((member) => (
                      <div key={member.telegramId} style={innerSurfaceStyle}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--theme-text-primary)',
                          }}
                        >
                          {member.firstName || member.username || t.manageQahal.unknownMember}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>
                          {member.username ? `@${member.username}` : '-'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => {
                    void loadCommunity();
                  }}
                  disabled={loading || !hasBackendCommunity}
                  className="px-[12px]"
                  style={secondaryActionStyle}
                >
                  {t.manageQahal.refresh}
                </button>
                {statusMessage ? (
                  <p style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

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
