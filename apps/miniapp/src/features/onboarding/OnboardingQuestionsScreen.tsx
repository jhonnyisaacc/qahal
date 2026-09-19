import type { EmunahState } from '@qahal/shared';
import { useI18n } from '../../app/i18n';

interface OnboardingQuestionsScreenProps {
  step: number;
  progressLabel: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
  emunahState?: EmunahState;
}

export const OnboardingQuestionsScreen = ({
  step,
  progressLabel,
  selectedValue,
  onSelect,
  onNext,
  onBack,
  onExit,
  emunahState,
}: OnboardingQuestionsScreenProps) => {
  const { t } = useI18n();
  const isStarting = emunahState === 'starting';

  const fullSteps = [
    {
      text: t.onboardingQuestions.introQuestion,
      references: t.onboardingQuestions.references[0] ?? [],
      kind: 'intro' as const,
    },
    ...t.onboardingQuestions.questions.map((question, index) => ({
      text: question,
      references: t.onboardingQuestions.references[index + 1] ?? [],
      kind: 'question' as const,
    })),
    {
      text: t.onboardingQuestions.resultQuestion,
      references:
        t.onboardingQuestions.references[t.onboardingQuestions.references.length - 1] ?? [],
      kind: 'result' as const,
    },
  ];

  const questionSteps = isStarting
    ? [fullSteps[0], fullSteps[1], fullSteps[3], fullSteps[fullSteps.length - 1]]
    : fullSteps;
  const currentStep = (questionSteps[step] ?? questionSteps[0] ?? fullSteps[0])!;
  const questionText = currentStep.text;
  const questionReferences = currentStep.references;
  const isIntro = currentStep.kind === 'intro';
  const isResult = currentStep.kind === 'result';

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Solid warm background (pure, no radial overlays) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-bg-main)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-[28px] pb-[36px] pt-[56px]">
        <div className="h-[14px]" />

        {/* Center content */}
        <div className="flex flex-col items-center gap-[24px] px-[8px]">
          {/* Question text — Paper 3QY-0 */}
          <h2
            className="qahal-display w-full text-center"
            style={{
              fontSize: 34,
              lineHeight: '120%',
              fontWeight: 600,
              color: 'var(--theme-onboarding-title)',
            }}
          >
            {questionText}
          </h2>

          {/* Intro explanation card or scripture references */}
          {isIntro ? (
            <div
              style={{
                background: 'var(--theme-onboarding-card-bg)',
                border: '1px solid var(--theme-onboarding-card-border)',
                boxShadow: 'var(--theme-onboarding-card-shadow)',
                borderRadius: 20,
                padding: '24px 20px',
                width: '100%',
              }}
            >
              <p
                className="text-center"
                style={{
                  fontSize: 15,
                  lineHeight: '155%',
                  color: 'var(--theme-onboarding-body)',
                }}
              >
                {t.onboardingQuestions.introBody}
              </p>
            </div>
          ) : isResult ? (
            <div
              style={{
                background: 'var(--theme-onboarding-card-bg)',
                border: '1px solid var(--theme-onboarding-card-border)',
                boxShadow: 'var(--theme-onboarding-card-shadow)',
                borderRadius: 20,
                padding: '24px 20px',
                width: '100%',
              }}
            >
              <p
                className="text-center"
                style={{
                  fontSize: 15,
                  lineHeight: '155%',
                  color: 'var(--theme-onboarding-body)',
                }}
              >
                {t.onboardingQuestions.resultBody}
              </p>
            </div>
          ) : questionReferences.length > 0 ? (
            <div
              className="flex w-full flex-col gap-[14px]"
              style={{
                borderRadius: 16,
                padding: '18px 16px',
              }}
            >
              {questionReferences.map((ref) => (
                <span
                  key={ref}
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    color: 'var(--brand-purple)',
                    fontWeight: 600,
                    opacity: 0.8,
                    textAlign: 'center',
                  }}
                >
                  {ref}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom buttons + dots */}
        <div className="flex flex-col gap-[16px]">
          {isIntro ? (
            /* Intro: single "Understood" button */
            <button
              type="button"
              onClick={onNext}
              className="flex shrink-0 items-center justify-center"
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
              {t.onboardingQuestions.understood}
            </button>
          ) : isResult ? (
            /* Result: single "Ok" button — returns to carousel */
            <button
              type="button"
              onClick={onExit}
              className="flex shrink-0 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 14,
                background: 'var(--theme-button-secondary-bg)',
                border: '1px solid var(--theme-button-secondary-border)',
                boxShadow: 'var(--theme-card-shadow)',
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--theme-button-secondary-text)',
              }}
            >
              {t.onboardingQuestions.ok}
            </button>
          ) : (
            /* Question: Yes / No buttons */
            <div className="grid grid-cols-2 gap-[12px]">
              {/* Yes button — Paper 3FC-0 */}
              <button
                type="button"
                onClick={() => {
                  onSelect('yes');
                  onNext();
                }}
                className={`flex shrink-0 items-center justify-center ${selectedValue === 'yes' ? 'ring-2 ring-white/30' : ''}`}
                style={{
                  height: 52,
                  borderRadius: 14,
                  background: 'var(--theme-button-primary-bg)',
                  border: '1px solid var(--theme-button-primary-border)',
                  boxShadow: 'var(--theme-button-primary-shadow)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--theme-button-primary-text)',
                }}
              >
                {t.onboardingQuestions.yes}
              </button>
              {/* No button — Paper 3FE-0 */}
              <button
                type="button"
                onClick={() => {
                  onSelect('no');
                  onNext();
                }}
                className={`flex shrink-0 items-center justify-center ${selectedValue === 'no' ? 'ring-2 ring-white/30' : ''}`}
                style={{
                  height: 52,
                  borderRadius: 14,
                  background: 'var(--theme-button-secondary-bg)',
                  border: '1px solid var(--theme-button-secondary-border)',
                  boxShadow: 'var(--theme-card-shadow)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--theme-button-secondary-text)',
                }}
              >
                {t.onboardingQuestions.no}
              </button>
            </div>
          )}

          {/* Progress dots — Paper 3FI-0, 3FH-0 */}
          <div className="flex items-center justify-center gap-[6px] py-[4px]">
            {Array.from({ length: questionSteps.length }).map((_, i) => (
              <span
                key={i}
                className="shrink-0 rounded-[99px]"
                style={{
                  width: i === step ? 24 : 12,
                  height: 3,
                  background:
                    i === step ? 'var(--brand-purple)' : 'var(--theme-onboarding-dot-inactive)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
