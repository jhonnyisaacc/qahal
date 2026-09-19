import { useI18n } from '../../../app/i18n';

interface JoinRequestToastProps {
  visible: boolean;
}

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13L9 17L19 7"
      stroke="#F5F0E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const JoinRequestToast = ({ visible }: JoinRequestToastProps) => {
  const { t } = useI18n();

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[100px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[12px]"
      style={{
        width: 327,
        borderRadius: 14,
        background: 'var(--brand-purple)',
        boxShadow: 'var(--theme-button-primary-shadow)',
        padding: '14px 16px',
      }}
    >
      <CheckIcon />
      <span style={{ fontSize: 14, fontWeight: 500, color: '#F5F0E8' }}>
        {t.home.joinRequestToast}
      </span>
    </div>
  );
};
