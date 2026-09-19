import type { EmunahState } from '@qahal/shared';
import { useState } from 'react';
import { useI18n } from '../../app/i18n';

interface OnboardingStateScreenProps {
  onSelect: (state: EmunahState) => void;
  onBack: () => void;
}

const OPTIONS: { value: EmunahState; labelEn: string; labelEs: string }[] = [
  {
    value: 'leader',
    labelEn: 'Congregation leader',
    labelEs: 'Líder de congregación',
  },
  {
    value: 'experienced',
    labelEn: 'Experienced in the Emunah',
    labelEs: 'Experimentado en la Emunah',
  },
  {
    value: 'starting',
    labelEn: 'Starting in the Emunah',
    labelEs: 'Comenzando en la Emunah',
  },
];

export const OnboardingStateScreen = ({ onSelect, onBack }: OnboardingStateScreenProps) => {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<EmunahState | null>(null);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Solid warm background (pure, no radial overlays) */}
      <div className="absolute inset-0" style={{ background: 'var(--theme-bg-main)' }} />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-16">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-8 self-start text-sm"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          ← {t.common.back}
        </button>

        <h1
          className="mb-3 font-display text-3xl font-semibold"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          {locale === 'es'
            ? '¿Cuál es tu estado actual en la Emunah?'
            : "What's your current state in the Emunah?"}
        </h1>

        <p className="mb-10 text-[15px]" style={{ color: 'var(--theme-text-secondary)' }}>
          {locale === 'es'
            ? 'Selecciona la opción que mejor te describa.'
            : 'Select the option that best describes you.'}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelected(option.value)}
                className="w-full rounded-2xl border px-5 py-4 text-left transition-all active:scale-[0.985]"
                style={{
                  borderColor: isSelected ? 'rgba(125, 90, 242, 0.28)' : 'var(--theme-card-border)',
                  background: isSelected ? 'rgba(125, 90, 242, 0.12)' : 'var(--theme-card-bg)',
                  boxShadow: isSelected ? 'var(--theme-card-shadow)' : 'none',
                }}
              >
                <div
                  className="text-[17px] font-medium"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {locale === 'es' ? option.labelEs : option.labelEn}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full rounded-2xl py-4 text-lg font-semibold disabled:opacity-40 active:opacity-90"
            style={{
              background: 'var(--theme-button-primary-bg)',
              border: '1px solid var(--theme-button-primary-border)',
              boxShadow: 'var(--theme-button-primary-shadow)',
              color: 'var(--theme-button-primary-text)',
            }}
          >
            {t.common.continue}
          </button>
        </div>
      </div>
    </section>
  );
};
