import { redesignCopy } from '../../app/i18n/redesign';
import { useEffect, useRef, useState } from 'react';
import { CitySearch } from './CitySearch';
import { useI18n } from '../../app/i18n';

interface OnboardingDataScreenProps {
  telegramId: number;
  initialFirstName: string;
  initialCity: string;
  initialLanguageCode: 'en' | 'es' | 'he';
  busy: boolean;
  onSubmit: (
    firstName: string,
    city: string,
    languageCode: 'en' | 'es' | 'he',
    cityCoordinates?: { latitude: number; longitude: number },
  ) => Promise<void>;
}

export const OnboardingDataScreen = ({
  telegramId,
  initialFirstName,
  initialCity,
  initialLanguageCode,
  busy,
  onSubmit,
}: OnboardingDataScreenProps) => {
  const { t } = useI18n();
  const [saveError, setSaveError] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [city, setCity] = useState(initialCity);
  const [cityCoordinates, setCityCoordinates] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);
  const [step, setStep] = useState<'name' | 'city'>('name');
  const [isNameInputFocused, setIsNameInputFocused] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = step === 'name' ? firstName.trim().length > 0 : true;

  useEffect(() => {
    if (step !== 'name') {
      setKeyboardInset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const updateKeyboardInset = () => {
      if (!isNameInputFocused) {
        setKeyboardInset(0);
        return;
      }

      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      // Ignore tiny viewport changes caused by browser chrome animations.
      setKeyboardInset(inset > 80 ? inset : 0);
    };

    updateKeyboardInset();
    viewport.addEventListener('resize', updateKeyboardInset);
    viewport.addEventListener('scroll', updateKeyboardInset);

    return () => {
      viewport.removeEventListener('resize', updateKeyboardInset);
      viewport.removeEventListener('scroll', updateKeyboardInset);
    };
  }, [isNameInputFocused, step]);

  const dismissNameKeyboard = (target: EventTarget | null) => {
    if (step !== 'name' || !isNameInputFocused) {
      return;
    }

    const node = target as HTMLElement | null;
    if (!node) {
      return;
    }

    if (node.closest("input, button, [role='button']")) {
      return;
    }

    nameInputRef.current?.blur();
    setIsNameInputFocused(false);
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      onPointerDownCapture={(event) => dismissNameKeyboard(event.target)}
    >
      {saveError && (
        <p className="relative z-20" role="alert">
          {redesignCopy(initialLanguageCode).error}
        </p>
      )}
      {/* Solid warm background (pure, no radial overlays) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-bg-main)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-between px-[28px] pt-[56px]"
        style={{
          paddingBottom: step === 'name' ? `${Math.max(20, 36 + keyboardInset)}px` : '36px',
        }}
      >
        <div className="h-[14px]" />

        {/* Center content */}
        <div className="flex flex-col items-center gap-[32px] px-[8px]">
          {/* Title — Paper 3RP-0 */}
          <h2
            className="qahal-display w-full text-center"
            style={{
              fontSize: 34,
              lineHeight: '120%',
              fontWeight: 600,
              color: 'var(--theme-onboarding-title)',
            }}
          >
            {step === 'name' ? t.onboardingData.nameTitle : t.onboardingData.cityTitle}
          </h2>

          {step === 'city' && (
            <p
              className="text-center"
              style={{
                fontSize: 14,
                lineHeight: '155%',
                color: 'var(--theme-text-secondary)',
                marginTop: -16,
              }}
            >
              {t.onboardingData.cityHint}
            </p>
          )}

          {/* Input — Paper 3TX-0 */}
          {step === 'name' ? (
            <input
              ref={nameInputRef}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setIsNameInputFocused(true)}
              onBlur={() => setIsNameInputFocused(false)}
              placeholder={t.onboardingData.namePlaceholder}
              autoFocus
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                padding: '0 16px',
                background: 'var(--theme-input-bg)',
                border: '1px solid var(--theme-input-border)',
                boxShadow: 'var(--theme-card-shadow)',
                fontSize: 15,
                color: 'var(--theme-input-text)',
                outline: 'none',
              }}
            />
          ) : (
            <CitySearch
              telegramId={telegramId}
              initialValue={city}
              onCitySelected={(suggestion) => {
                setCity(suggestion.city);
                setCityCoordinates({
                  latitude: suggestion.latitude,
                  longitude: suggestion.longitude,
                });
              }}
            />
          )}
        </div>

        {/* Bottom buttons + dots */}
        <div className="flex flex-col gap-[16px]">
          {/* Continue button — Paper 3RH-0 */}
          <button
            type="button"
            disabled={!canContinue || busy}
            onClick={() => {
              if (step === 'name') {
                nameInputRef.current?.blur();
                setIsNameInputFocused(false);
                setStep('city');
              } else {
                setSaveError(false);
                void onSubmit(
                  firstName.trim(),
                  city.trim(),
                  initialLanguageCode,
                  cityCoordinates,
                ).catch(() => setSaveError(true));
              }
            }}
            className="flex shrink-0 items-center justify-center disabled:opacity-40"
            style={{
              height: 52,
              borderRadius: 14,
              background: 'var(--theme-button-primary-bg)',
              border: '1px solid var(--theme-button-primary-border)',
              boxShadow: 'var(--theme-button-primary-shadow)',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: 'var(--theme-button-primary-text)',
            }}
          >
            {busy ? t.onboardingData.saving : t.common.continue}
          </button>

          {step === 'city' && (
            <button
              type="button"
              onClick={() => setStep('name')}
              className="flex shrink-0 items-center justify-center"
              style={{
                height: 44,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--theme-text-secondary)',
              }}
            >
              {t.common.back}
            </button>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-[6px] py-[4px]">
            <span
              className="shrink-0 rounded-[99px]"
              style={{
                width: step === 'name' ? 24 : 12,
                height: 3,
                background:
                  step === 'name' ? 'var(--brand-purple)' : 'var(--theme-onboarding-dot-inactive)',
              }}
            />
            <span
              className="shrink-0 rounded-[99px]"
              style={{
                width: step === 'city' ? 24 : 12,
                height: 3,
                background:
                  step === 'city' ? 'var(--brand-purple)' : 'var(--theme-onboarding-dot-inactive)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
