import '@telegram-apps/telegram-ui/dist/styles.css';
import './styles/index.css';

import { AppRoot } from '@telegram-apps/telegram-ui';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  bootstrapTelegram,
  applyTelegramInsets,
  subscribeTelegramInsets,
  getTelegramColorScheme,
  subscribeThemeChanged,
} from './lib/telegram';
import { readStoredThemeMode, writeStoredThemeMode, type ThemeMode } from './app/theme';

const resolveInitialThemeMode = (): ThemeMode => {
  const stored = readStoredThemeMode();
  if (stored) {
    return stored;
  }

  return getTelegramColorScheme() ?? 'light';
};

function Bootstrap() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => resolveInitialThemeMode());

  useEffect(() => {
    bootstrapTelegram();
    const unsubscribeInsets = subscribeTelegramInsets();
    const unsubscribeTheme = subscribeThemeChanged((colorScheme) => {
      if (!colorScheme) {
        return;
      }

      setThemeMode(colorScheme);
    });
    return () => {
      unsubscribeInsets();
      unsubscribeTheme();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    writeStoredThemeMode(themeMode);
  }, [themeMode]);

  return (
    <AppRoot appearance={themeMode}>
      <App themeMode={themeMode} onThemeChange={setThemeMode} />
    </AppRoot>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

applyTelegramInsets();
document.documentElement.setAttribute('data-theme-mode', resolveInitialThemeMode());

createRoot(root).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
);
