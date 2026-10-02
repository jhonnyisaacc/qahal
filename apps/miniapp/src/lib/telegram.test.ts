import { describe, expect, it, vi } from 'vitest';
import { bootstrapTelegram, getTelegramColorScheme, subscribeThemeChanged } from './telegram';

describe('telegram helpers', () => {
  it('returns null and stays safe outside Telegram', () => {
    delete window.Telegram;

    expect(getTelegramColorScheme()).toBeNull();
    expect(() => bootstrapTelegram()).not.toThrow();
  });

  it('boots the Telegram WebApp when available', () => {
    const ready = vi.fn();
    const expand = vi.fn();

    window.Telegram = {
      WebApp: {
        ready,
        expand,
        colorScheme: 'dark',
      },
    };

    bootstrapTelegram();

    expect(ready).toHaveBeenCalledOnce();
    expect(expand).toHaveBeenCalledOnce();
    expect(getTelegramColorScheme()).toBe('dark');
  });

  it('subscribes to and unsubscribes from Telegram theme changes', () => {
    let onThemeChanged: (() => void) | undefined;
    const callback = vi.fn();
    const offEvent = vi.fn();

    window.Telegram = {
      WebApp: {
        ready: vi.fn(),
        expand: vi.fn(),
        colorScheme: 'light',
        onEvent: vi.fn((eventName: string, handler: () => void) => {
          if (eventName === 'themeChanged') {
            onThemeChanged = handler;
          }
        }),
        offEvent,
      },
    };

    const unsubscribe = subscribeThemeChanged(callback);
    window.Telegram!.WebApp!.colorScheme = 'dark';
    onThemeChanged?.();
    unsubscribe();

    expect(callback).toHaveBeenCalledWith('dark');
    expect(offEvent).toHaveBeenCalledWith('themeChanged', expect.any(Function));
  });
});
