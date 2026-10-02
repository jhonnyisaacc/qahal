import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../../lib/api';
import { getTelegramWebApp } from '../../lib/telegram';
import { redesignCopy } from '../../app/i18n/redesign';

export function AccessGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'code' | 'admitted' | 'error'>('loading');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const lang =
    (getTelegramWebApp()?.initDataUnsafe?.user as { language_code?: string } | undefined)
      ?.language_code ?? 'en';
  const copy = redesignCopy(lang);
  async function check() {
    try {
      const result = await api.accessStatus();
      setStatus(result.admitted ? 'admitted' : 'code');
    } catch {
      setStatus('error');
    }
  }
  useEffect(() => {
    void check();
    // Avoid recursive retries on auth failures emitted by the access endpoint itself.
    const invalidate = () => setStatus((current) => (current === 'admitted' ? 'error' : current));
    window.addEventListener('qahal:access-check', invalidate);
    return () => window.removeEventListener('qahal:access-check', invalidate);
  }, []);
  if (status === 'admitted') return children;
  return (
    <main className="redesign-screen" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h1 className="qahal-display text-3xl">Qahal</h1>
      {status === 'loading' ? (
        <p role="status">{copy.loading}</p>
      ) : status === 'error' ? (
        <>
          <p role="alert">{copy.telegramRequired}</p>
          <button onClick={() => void check()}>{copy.retry}</button>
        </>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(false);
            try {
              await api.redeemCode(code);
              setCode('');
              await check();
            } catch {
              setError(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl">{copy.invitation}</h2>
          <p>{copy.invitationHint}</p>
          <label htmlFor="access-code">{copy.code}</label>
          <input
            id="access-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={128}
            required
          />
          {error && <p role="alert">{copy.codeError}</p>}
          <button disabled={busy || !code.trim()}>{busy ? copy.loading : copy.continue}</button>
        </form>
      )}
    </main>
  );
}
