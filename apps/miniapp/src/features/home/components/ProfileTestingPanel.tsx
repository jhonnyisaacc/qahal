import { useI18n } from '../../../app/i18n';

export type LocalProfileRole = 'none' | 'member' | 'leader';

interface ProfileTestingPanelProps {
  visible: boolean;
  role: LocalProfileRole;
  onRoleChange: (role: LocalProfileRole) => void;
  onClose: () => void;
}

export const ProfileTestingPanel = ({
  visible,
  role,
  onRoleChange,
  onClose,
}: ProfileTestingPanelProps) => {
  const { t } = useI18n();

  const roleOptions: Array<{ value: LocalProfileRole; label: string; description: string }> = [
    {
      value: 'none',
      label: t.profile.roleNone,
      description: t.profile.roleNoneDesc,
    },
    {
      value: 'member',
      label: t.profile.roleMember,
      description: t.profile.roleMemberDesc,
    },
    {
      value: 'leader',
      label: t.profile.roleLeader,
      description: t.profile.roleLeaderDesc,
    },
  ];

  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 px-[24px]">
      <div
        className="flex w-[320px] flex-col gap-[14px]"
        style={{
          background: '#F5F0E8',
          borderRadius: 24,
          border: '1px solid var(--brand-purple)4D',
          boxShadow: '#1C252526 0px 12px 40px, #1C252514 0px 4px 12px',
          padding: '22px 18px',
        }}
      >
        <h3
          className="qahal-display text-center"
          style={{ fontSize: 22, fontWeight: 600, color: '#1C2526' }}
        >
          {t.profile.testingRoleTitle}
        </h3>

        <p className="text-center" style={{ fontSize: 13, color: '#5A5A52' }}>
          {t.profile.testingRoleBody}
        </p>

        <div className="flex flex-col gap-[8px]">
          {roleOptions.map((option) => {
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onRoleChange(option.value)}
                className="flex flex-col items-start rounded-[12px] px-[12px] py-[10px] text-left"
                style={{
                  border: selected ? '1px solid #1E5C5A' : '1px solid #D5C8B6',
                  background: selected ? '#1E5C5A14' : '#FFFFFF99',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1C2526' }}>
                  {option.label}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{option.description}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-[4px] flex w-full items-center justify-center"
          style={{
            height: 44,
            borderRadius: 12,
            background: '#1E5C5A',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          {t.common.done}
        </button>
      </div>
    </div>
  );
};
