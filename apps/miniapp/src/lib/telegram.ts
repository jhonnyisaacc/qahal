declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        safeAreaInset?: Partial<Record<'top' | 'bottom' | 'left' | 'right', number>>;
        contentSafeAreaInset?: Partial<Record<'top' | 'bottom' | 'left' | 'right', number>>;
        LocationManager?: {
          init: (callback: () => void) => void;
          isLocationAvailable?: boolean;
          getLocation: (
            callback: (location: { latitude: number; longitude: number } | null) => void,
          ) => void;
        };
        HapticFeedback?: { notificationOccurred: (type: 'success' | 'error' | 'warning') => void };
        ready: () => void;
        expand: () => void;
        colorScheme?: 'light' | 'dark';
        initData?: string;
        initDataUnsafe?: Record<string, unknown>;
        onEvent?: (eventName: string, cb: () => void) => void;
        offEvent?: (eventName: string, cb: () => void) => void;
      };
    };
  }
}

export type TelegramColorScheme = 'light' | 'dark';

export const getTelegramWebApp = () => window.Telegram?.WebApp;

export const getTelegramColorScheme = (): TelegramColorScheme | null => {
  const colorScheme = getTelegramWebApp()?.colorScheme;
  return colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : null;
};

const initializedApps = new WeakSet<object>();

export const bootstrapTelegram = () => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return;
  }

  applyTelegramInsets();
  if (!initializedApps.has(webApp)) {
    webApp.ready();
    webApp.expand();
    initializedApps.add(webApp);
  }
};

export const subscribeThemeChanged = (
  callback: (colorScheme: TelegramColorScheme | null) => void,
) => {
  const webApp = getTelegramWebApp();
  if (!webApp?.onEvent || !webApp?.offEvent) {
    return () => {};
  }

  const onThemeChanged = () => {
    callback(getTelegramColorScheme());
  };

  webApp.onEvent('themeChanged', onThemeChanged);
  return () => webApp.offEvent?.('themeChanged', onThemeChanged);
};

export function hapticSuccess() {
  getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success');
}
export function requestTelegramLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    const manager = getTelegramWebApp()?.LocationManager;
    if (!manager) {
      reject(new Error('location_unavailable'));
      return;
    }
    const timer = window.setTimeout(() => reject(new Error('location_timeout')), 15000);
    manager.init(() => {
      if (!manager.isLocationAvailable) {
        clearTimeout(timer);
        reject(new Error('location_unavailable'));
        return;
      }
      manager.getLocation((location) => {
        clearTimeout(timer);
        if (!location) reject(new Error('location_denied'));
        else
          resolve({
            latitude: Math.round(location.latitude * 20) / 20,
            longitude: Math.round(location.longitude * 20) / 20,
          });
      });
    });
  });
}

export function applyTelegramInsets() {
  const app = getTelegramWebApp();
  for (const side of ['top', 'bottom', 'left', 'right'] as const) {
    const device = app?.safeAreaInset?.[side];
    const content = app?.contentSafeAreaInset?.[side];
    if (device !== undefined || content !== undefined) {
      document.documentElement.style.setProperty(
        `--safe-area-${side}`,
        `${Math.max(0, device ?? 0) + Math.max(0, content ?? 0)}px`,
      );
    }
  }
}
export function subscribeTelegramInsets() {
  const app = getTelegramWebApp();
  applyTelegramInsets();
  app?.onEvent?.('safeAreaChanged', applyTelegramInsets);
  app?.onEvent?.('contentSafeAreaChanged', applyTelegramInsets);
  return () => {
    app?.offEvent?.('safeAreaChanged', applyTelegramInsets);
    app?.offEvent?.('contentSafeAreaChanged', applyTelegramInsets);
  };
}
