import { lazy, Suspense } from 'react';
import { redesignCopy } from './app/i18n/redesign';
import { OnboardingCarouselScreen } from './features/onboarding/OnboardingCarouselScreen';
import { OnboardingStateScreen } from './features/onboarding/OnboardingStateScreen';
import { OnboardingQuestionsScreen } from './features/onboarding/OnboardingQuestionsScreen';
import { OnboardingDataScreen } from './features/onboarding/OnboardingDataScreen';
import { AccessGate } from './features/access/AccessGate';
const HomeScreen = lazy(() =>
  import('./features/home/HomeScreen').then((module) => ({ default: module.HomeScreen })),
);
const ManageQahalScreen = lazy(() =>
  import('./features/manage').then((module) => ({ default: module.ManageQahalScreen })),
);
const ProfileScreen = lazy(() =>
  import('./features/profile/ProfileScreen').then((module) => ({ default: module.ProfileScreen })),
);
import { useAppFlow } from './app/useAppFlow';
import { resolvePaperScreenKey } from './app/paperMapping';
import { I18nProvider } from './app/i18n';
import { getNextThemeMode, type ThemeMode } from './app/theme';

interface AppProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export default function App(props: AppProps) {
  return (
    <AccessGate>
      <AppContent {...props} />
    </AccessGate>
  );
}
function AppContent({ themeMode, onThemeChange }: AppProps) {
  const {
    runtimeTarget,
    profileLoading,
    profileError,
    profileTestingEnabled,
    state,
    busy,
    communities,
    effectiveProfile,
    localProfileRole,
    confirmedBirthDate,
    questionProgress,
    startQuestions,
    selectEmunahState,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToCarousel,
    updateProfile,
    finishOnboarding,
    setMapVariant,
    setHomeVariant,
    goToHome,
    goToMap,
    goToProfile,
    goToManageQahal,
    setLocalProfileRole,
    setLocalProfileName,
    setConfirmedBirthDate,
    resetLocalData,
    localDataResetEnabled,
    setMapCity,
    setLanguageCode,
    managedCommunity,
    refreshPersistedProfile,
  } = useAppFlow();
  const paperScreenKey = resolvePaperScreenKey(state);

  return (
    <I18nProvider languageCode={state.answers.languageCode} onLanguageCodeChange={setLanguageCode}>
      <div
        className="relative mx-auto min-h-[100dvh] w-full max-w-[375px] overflow-hidden font-body"
        data-paper-screen={paperScreenKey}
        data-runtime={runtimeTarget}
        data-theme-mode={themeMode}
        style={{
          background: 'var(--theme-bg-solid)',
          color: 'var(--theme-text-primary)',
        }}
      >
        <button
          type="button"
          onClick={() => onThemeChange(getNextThemeMode(themeMode))}
          className="absolute right-3 z-[85] flex h-10 w-10 items-center justify-center rounded-full border"
          style={{
            top: 'calc(var(--safe-area-top) + 12px)',
            borderColor: 'var(--theme-toggle-border)',
            background: 'var(--theme-toggle-bg)',
            color: 'var(--theme-toggle-icon)',
            boxShadow: 'var(--theme-toggle-shadow)',
          }}
          aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={themeMode === 'light' ? 'Dark mode' : 'Light mode'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 14.5H15M9.5 17.5H14.5M12 3C8.96 3 6.5 5.46 6.5 8.5C6.5 10.37 7.43 12.02 8.86 13V14.5C8.86 15.33 9.53 16 10.36 16H13.64C14.47 16 15.14 15.33 15.14 14.5V13C16.57 12.02 17.5 10.37 17.5 8.5C17.5 5.46 15.04 3 12 3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {profileTestingEnabled ? (
          <div
            className="pointer-events-none absolute left-1/2 z-[70] -translate-x-1/2"
            style={{ top: 'calc(var(--safe-area-top) + 12px)' }}
          >
            <label
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
              style={{
                borderColor: 'var(--theme-card-border)',
                background: 'var(--theme-card-bg)',
                color: 'var(--theme-text-primary)',
                boxShadow: 'var(--theme-card-shadow)',
              }}
              htmlFor="debug-language-switcher"
            >
              <span>Language</span>
              <select
                id="debug-language-switcher"
                value={state.answers.languageCode}
                onChange={(event) => setLanguageCode(event.target.value as 'en' | 'es' | 'he')}
                className="rounded-md border px-2 py-1 text-xs outline-none"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  background: 'var(--theme-surface-warm-muted)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="he">Hebrew</option>
              </select>
            </label>
          </div>
        ) : null}

        {profileLoading ? (
          <p className="redesign-screen" role="status">
            {redesignCopy(state.answers.languageCode).loading}
          </p>
        ) : profileError ? (
          <section className="redesign-screen" role="alert">
            <p>{redesignCopy(state.answers.languageCode).error}</p>
            <button onClick={refreshPersistedProfile}>
              {redesignCopy(state.answers.languageCode).retry}
            </button>
          </section>
        ) : (
          <Suspense
            fallback={
              <p role="status" className="redesign-screen">
                {redesignCopy(state.answers.languageCode).loading}
              </p>
            }
          >
            {state.screen === 'onboarding-carousel' ? (
              <OnboardingCarouselScreen onStart={startQuestions} />
            ) : null}

            {state.screen === 'onboarding-state' ? (
              <OnboardingStateScreen
                onSelect={(emunahState) => {
                  selectEmunahState(emunahState);
                }}
                onBack={goToCarousel}
              />
            ) : null}

            {state.screen === 'onboarding-questions' ? (
              <OnboardingQuestionsScreen
                step={state.questionStep}
                progressLabel={questionProgress}
                selectedValue={state.answers.values[state.questionStep]}
                onSelect={answerQuestion}
                onNext={nextQuestion}
                onBack={previousQuestion}
                onExit={goToCarousel}
                emunahState={state.answers.emunahState}
              />
            ) : null}

            {state.screen === 'onboarding-data' ? (
              <OnboardingDataScreen
                telegramId={state.telegramId}
                initialFirstName={state.answers.firstName}
                initialCity={state.answers.city}
                initialLanguageCode={state.answers.languageCode}
                busy={busy}
                onSubmit={async (firstName, city, languageCode, cityCoordinates) => {
                  setLanguageCode(languageCode);
                  updateProfile(firstName, city, languageCode, cityCoordinates);
                  await finishOnboarding({
                    firstName,
                    city,
                    languageCode,
                    cityCoordinates,
                  });
                }}
              />
            ) : null}

            {state.screen === 'home' || state.screen === 'map' ? (
              <HomeScreen
                telegramId={state.telegramId}
                city={state.answers.city}
                latitude={state.answers.cityLatitude}
                longitude={state.answers.cityLongitude}
                onAreaChange={(city) => setMapCity(city.city, city)}
                variant={state.homeVariant}
                communities={communities}
                onVariantChange={setHomeVariant}
                onGoMap={goToMap}
                onGoProfile={goToProfile}
                onGoManageQahal={goToManageQahal}
                profileTestingEnabled={profileTestingEnabled}
                effectiveProfile={effectiveProfile}
              />
            ) : null}

            {state.screen === 'manage-qahal' ? (
              <ManageQahalScreen
                telegramId={state.telegramId}
                managedCommunity={managedCommunity}
                managedCommunityId={effectiveProfile.managedCommunityId}
                profileTestingEnabled={profileTestingEnabled}
                canManageQahal={effectiveProfile.canManageQahal}
                onGoHome={goToHome}
                onGoMap={goToMap}
                onGoProfile={goToProfile}
              />
            ) : null}

            {state.screen === 'profile' ? (
              <ProfileScreen
                telegramId={state.telegramId}
                profileTestingEnabled={profileTestingEnabled}
                localProfileRole={localProfileRole}
                onRoleChange={setLocalProfileRole}
                profileName={effectiveProfile.displayName}
                profileQahalName={effectiveProfile.qahalName}
                profileBadges={effectiveProfile.badges}
                onProfileNameChange={setLocalProfileName}
                confirmedBirthDate={confirmedBirthDate}
                onConfirmBirthDate={setConfirmedBirthDate}
                onDemoScenarioApplied={refreshPersistedProfile}
                canResetLocalData={localDataResetEnabled}
                onResetLocalData={resetLocalData}
                onGoHome={goToHome}
                onGoMap={goToMap}
              />
            ) : null}
          </Suspense>
        )}
      </div>
    </I18nProvider>
  );
}
