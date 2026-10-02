import { useEffect, useState } from 'react';
import type { DiscoveryPreferences } from '@qahal/shared';
import { api } from '../../lib/api';
import { useI18n } from '../../app/i18n';
import { redesignCopy } from '../../app/i18n/redesign';
export function DiscoveryPrivacy() {
  const { languageCode } = useI18n();
  const copy = redesignCopy(languageCode);
  const [value, setValue] = useState<DiscoveryPreferences | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    api
      .getDiscoveryPreferences()
      .then(setValue)
      .catch(() => setError(true));
  };
  useEffect(load, []);
  async function save(next: DiscoveryPreferences) {
    setBusy(true);
    setError(false);
    try {
      await api.setDiscoveryPreferences(next);
      setValue(next);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="redesign-card">
      <h2>{copy.privacy}</h2>
      {value && (
        <div className="flex flex-col gap-3">
          <label>
            <input
              type="checkbox"
              disabled={busy}
              checked={value.discoverable}
              onChange={(e) => void save({ ...value, discoverable: e.target.checked })}
            />{' '}
            {copy.discoverable}
          </label>
          <label>
            <input
              type="checkbox"
              disabled={busy}
              checked={value.contactVisible}
              onChange={(e) => void save({ ...value, contactVisible: e.target.checked })}
            />{' '}
            {copy.contactVisible}
          </label>
        </div>
      )}
      {error && (
        <p role="alert">
          {copy.error} <button onClick={load}>{copy.retry}</button>
        </p>
      )}
    </section>
  );
}
