import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../../app/i18n';

interface OnboardingCarouselScreenProps {
  onStart: () => void;
}

const TOTAL_SLIDES = 3;

export const OnboardingCarouselScreen = ({ onStart }: OnboardingCarouselScreenProps) => {
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);
  const touchRef = useRef({ startX: 0, delta: 0, active: false });
  const [dragDelta, setDragDelta] = useState(0);

  const primaryActionStyle = {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    border: '1px solid var(--theme-button-primary-border)',
    background: 'var(--theme-button-primary-bg)',
    boxShadow: 'var(--theme-button-primary-shadow)',
    color: 'var(--theme-button-primary-text)',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.02em',
  } satisfies React.CSSProperties;

  const secondaryActionStyle = {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    border: '1px solid var(--theme-button-secondary-border)',
    background: 'var(--theme-button-secondary-bg)',
    color: 'var(--theme-button-secondary-text)',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.01em',
    boxShadow: 'var(--theme-card-shadow)',
  } satisfies React.CSSProperties;

  const goTo = useCallback((i: number) => {
    setSlide(Math.max(0, Math.min(TOTAL_SLIDES - 1, i)));
    setDragDelta(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    touchRef.current = {
      startX: touch.clientX,
      delta: 0,
      active: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current.active) return;
    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    const delta = touch.clientX - touchRef.current.startX;
    touchRef.current.delta = delta;
    setDragDelta(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current.active) return;
    touchRef.current.active = false;
    const d = touchRef.current.delta;
    if (d < -60 && slide < TOTAL_SLIDES - 1) {
      goTo(slide + 1);
    } else if (d > 60 && slide > 0) {
      goTo(slide - 1);
    } else {
      setDragDelta(0);
    }
  }, [slide, goTo]);

  const delta = touchRef.current.active ? dragDelta : 0;
  const transition = touchRef.current.active ? 'none' : 'transform 0.3s ease-out';

  const slideShellStyle = {
    paddingBottom: 'calc(28px + var(--safe-area-bottom))',
  } satisfies React.CSSProperties;

  /* Progress dots — fills up as you advance (Paper XQ/XR/XS pattern) */
  const dots = (
    <div className="flex items-center justify-center gap-[6px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[3px] w-[28px] rounded-[2px]"
          style={{
            backgroundColor:
              i <= slide ? 'var(--theme-accent)' : 'var(--theme-onboarding-dot-inactive)',
            opacity: 1,
          }}
        />
      ))}
    </div>
  );

  return (
    <section
      className="relative h-[100dvh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Solid warm background (pure, no radial overlays) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-bg-main)',
        }}
      />

      {/* ─── Slide 1 — Paper KR-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pt-[56px]"
        style={{
          ...slideShellStyle,
          transform: `translateX(calc(${(0 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* QAHAL title — Paper XD-0 */}
        <div className="mt-[48px] text-center">
          <h1
            className="qahal-display"
            style={{
              fontSize: 62,
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: '76px',
              color: 'var(--theme-onboarding-title)',
              textShadow: 'var(--theme-onboarding-title-shadow)',
            }}
          >
            QAHAL
          </h1>
          {/* Paper XE-0: Hebrew subtitle */}
          <p
            className="qahal-display"
            style={{
              fontSize: 18,
              letterSpacing: '0.15em',
              color: 'var(--theme-onboarding-subtitle)',
              opacity: 1,
            }}
          >
            קהל
          </p>
        </div>

        <div className="flex-1" />

        {/* Content card — Paper XF-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: '28px 24px',
            background: 'var(--theme-onboarding-card-bg)',
            border: '1px solid var(--theme-onboarding-card-border)',
            boxShadow: 'var(--theme-onboarding-card-shadow)',
          }}
        >
          {/* Card heading — Paper XG-0 */}
          <h2
            className="qahal-display"
            style={{
              fontSize: 26,
              lineHeight: '32px',
              fontWeight: 600,
              color: 'var(--theme-onboarding-title)',
              marginBottom: 14,
            }}
          >
            {t.onboardingCarousel.slide1Title}
          </h2>

          {/* Card body — Paper XH-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: '22px',
              color: 'var(--theme-onboarding-body)',
              opacity: 1,
            }}
          >
            {t.onboardingCarousel.slide1Subtitle}
          </p>

          <div className="mt-[20px]">{dots}</div>
        </div>

        <div className="mt-[16px]">
          <button type="button" onClick={() => goTo(1)} style={primaryActionStyle}>
            {t.onboardingCarousel.slide1Button}
          </button>
        </div>
      </div>

      {/* ─── Slide 2 — Paper XT-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pt-[56px]"
        style={{
          ...slideShellStyle,
          transform: `translateX(calc(${(1 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* Title — Paper 17C-0 */}
        <h1
          className="qahal-display mt-[24px] text-center"
          style={{
            fontSize: 40,
            lineHeight: '46px',
            fontWeight: 700,
            color: 'var(--theme-onboarding-title)',
            textShadow: 'var(--theme-onboarding-title-shadow)',
          }}
        >
          {t.onboardingCarousel.slide2Title}
        </h1>

        <div className="flex-1" />

        {/* Content card — Paper 17D-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: '24px 22px',
            background: 'var(--theme-onboarding-card-bg)',
            border: '1px solid var(--theme-onboarding-card-border)',
            boxShadow: 'var(--theme-onboarding-card-shadow)',
          }}
        >
          {/* Body — Paper 17E-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: '23px',
              color: 'var(--theme-onboarding-body)',
              opacity: 1,
              textAlign: 'center',
            }}
          >
            {t.onboardingCarousel.slide2Body}
          </p>
        </div>

        {/* Button + dots — Paper 17F-0 */}
        <div className="mt-[16px]">
          <div className="mt-[16px]">{dots}</div>
          <div className="mt-[16px] grid grid-cols-2 gap-3">
            <button type="button" onClick={() => goTo(0)} style={secondaryActionStyle}>
              {t.common.back}
            </button>
            <button type="button" onClick={() => goTo(2)} style={primaryActionStyle}>
              {t.onboardingCarousel.slide2Button}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Slide 3 — Paper 17M-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pt-[56px]"
        style={{
          ...slideShellStyle,
          transform: `translateX(calc(${(2 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* Title — Paper 1IW-0 */}
        <h1
          className="qahal-display mt-[24px] text-center"
          style={{
            fontSize: 38,
            lineHeight: '44px',
            fontWeight: 700,
            color: 'var(--theme-onboarding-title)',
            textShadow: 'var(--theme-onboarding-title-shadow)',
          }}
        >
          {t.onboardingCarousel.slide3Title}
        </h1>

        <div className="flex-1" />

        {/* Content card — Paper 1IX-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: '24px 22px',
            background: 'var(--theme-onboarding-card-bg)',
            border: '1px solid var(--theme-onboarding-card-border)',
            boxShadow: 'var(--theme-onboarding-card-shadow)',
          }}
        >
          {/* Body — Paper 1IY-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: '23px',
              color: 'var(--theme-onboarding-body)',
              opacity: 1,
              textAlign: 'center',
            }}
          >
            {t.onboardingCarousel.slide3Body}
          </p>
        </div>

        {/* Button + dots — Paper 1IZ-0 */}
        <div className="mt-[16px]">
          <div className="mt-[16px]">{dots}</div>
          <div className="mt-[16px] grid grid-cols-2 gap-3">
            <button type="button" onClick={() => goTo(1)} style={secondaryActionStyle}>
              {t.onboardingCarousel.slide3SecondaryButton}
            </button>
            <button
              type="button"
              onClick={onStart}
              style={{
                ...primaryActionStyle,
                minHeight: 56,
                fontSize: 17,
              }}
            >
              {t.onboardingCarousel.slide3PrimaryButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
