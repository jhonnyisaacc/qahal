import { useI18n } from "../../../app/i18n";

interface MapNoPermissionOverlayProps {
  visible: boolean;
  onEnable: () => void;
}

const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 10.5C15 12.157 13.657 13.5 12 13.5C10.343 13.5 9 12.157 9 10.5C9 8.843 10.343 7.5 12 7.5C13.657 7.5 15 8.843 15 10.5Z" stroke="#1E5C5A" strokeWidth="1.5" />
    <path d="M19.5 10.5C19.5 17.642 12 21.75 12 21.75C12 21.75 4.5 17.642 4.5 10.5C4.5 6.358 7.858 3 12 3C16.142 3 19.5 6.358 19.5 10.5Z" stroke="#1E5C5A" strokeWidth="1.5" />
  </svg>
);

export const MapNoPermissionOverlay = ({ visible, onEnable }: MapNoPermissionOverlayProps) => {
  const { t } = useI18n();

  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 px-[24px]">
      <div
        className="flex w-[280px] flex-col items-center gap-[20px] text-center"
        style={{
          background: "var(--theme-card-bg)",
          borderRadius: 20,
          border: "1px solid var(--theme-card-border)",
          boxShadow: "#1C252526 0px 12px 40px, #1C25260F 0px 4px 12px",
          padding: "32px 24px",
        }}
      >
        <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: "#1E5C5A1A" }}>
          <LocationIcon />
        </div>
        <h3
          className="qahal-display"
          style={{ fontSize: 22, fontWeight: 600, color: "var(--theme-text-primary)" }}
        >
          {t.map.noPermissionTitle}
        </h3>
        <p style={{ fontSize: 15, lineHeight: "22px", color: "var(--theme-text-secondary)" }}>
          {t.map.noPermissionBody}
        </p>
        <button
          type="button"
          onClick={onEnable}
          className="flex w-full items-center justify-center"
          style={{
            height: 48,
            borderRadius: 14,
            background: "#1E5C5A",
            border: "2px solid var(--brand-purple)",
            fontSize: 15,
            fontWeight: 600,
            color: "#F5F0E8",
          }}
        >
          {t.map.noPermissionCta}
        </button>
      </div>
    </div>
  );
};
