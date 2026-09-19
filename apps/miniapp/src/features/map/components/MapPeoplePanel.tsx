import type { CommunityPerson } from '../../../lib/api';
import { useI18n } from '../../../app/i18n';

interface MapPeoplePanelProps {
  visible: boolean;
  people: CommunityPerson[];
  onSelectPerson: (person: CommunityPerson) => void;
}

export const MapPeoplePanel = ({ visible, people, onSelectPerson }: MapPeoplePanelProps) => {
  const { t } = useI18n();

  if (!visible) {
    return null;
  }

  const panelStyle = {
    borderRadius: 20,
    background: 'var(--theme-card-bg)',
    border: '1px solid var(--theme-card-border)',
    boxShadow: 'var(--theme-card-shadow)',
  };

  const rowStyle = {
    borderRadius: 14,
    padding: '12px 14px',
    background: 'var(--theme-bg-main)',
    border: '1px solid var(--theme-surface-warm-border)',
  };

  return (
    <div
      className="absolute bottom-[246px] right-4 z-30 w-[286px] overflow-hidden"
      style={panelStyle}
    >
      <div className="px-[16px] pb-[10px] pt-[14px]">
        <div
          className="qahal-display"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--theme-text-primary)',
            lineHeight: '22px',
          }}
        >
          {t.map.peopleNearby}
        </div>
      </div>

      <div
        className="max-h-[264px] overflow-y-auto px-[12px] pb-[12px]"
        style={{ borderTop: '1px solid var(--theme-card-border)' }}
      >
        {people.length === 0 ? (
          <div className="mt-[12px]" style={rowStyle}>
            <div style={{ fontSize: 13, color: 'var(--theme-text-secondary)' }}>
              {t.map.noPeopleNearby}
            </div>
          </div>
        ) : (
          people.map((person) => {
            const isLeader = person.badges.some((badge) => badge.kind === 'messenger');
            return (
              <button
                key={person.id}
                type="button"
                className="mt-[12px] flex w-full flex-col gap-[10px] text-left first:mt-0"
                style={rowStyle}
                onClick={() => onSelectPerson(person)}
              >
                <div className="flex items-start gap-[10px]">
                  <div
                    className="flex shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(125, 90, 242, 0.08)',
                      border: '1px solid rgba(125, 90, 242, 0.14)',
                      color: 'var(--brand-accent)',
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {person.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="qahal-display overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--theme-text-primary)',
                        lineHeight: '20px',
                      }}
                    >
                      {person.name}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: 'var(--theme-text-secondary)',
                        lineHeight: '16px',
                      }}
                    >
                      {person.city}
                    </div>
                  </div>

                  {isLeader ? (
                    <span
                      className="shrink-0 rounded-full px-[10px] py-[6px]"
                      style={{
                        background: 'rgba(125, 90, 242, 0.08)',
                        border: '1px solid rgba(125, 90, 242, 0.14)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: 'var(--brand-accent)',
                      }}
                    >
                      {t.map.leader}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-end gap-[8px]">
                  <span
                    className="flex shrink-0 items-center rounded-full px-[10px] py-[6px]"
                    style={{
                      background: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-surface-warm-border)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--theme-text-primary)',
                    }}
                  >
                    {t.common.continue}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
