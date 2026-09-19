import { requestTelegramLocation } from '../../lib/telegram';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import type { CitySuggestion } from '@qahal/shared';
import { api } from '../../lib/api';
import { useI18n } from '../../app/i18n';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface CitySearchProps {
  telegramId: number;
  initialValue?: string;
  onCitySelected: (city: CitySuggestion) => void;
}

export const CitySearch = ({ telegramId, initialValue = '', onCitySelected }: CitySearchProps) => {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialValue);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);
  const debouncedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      api
        .searchCities(debouncedQuery, controller.signal, userLocation ?? undefined)
        .then((res) => {
          setSuggestions(res.suggestions);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debouncedQuery, userLocation]);

  const requestLocationAccess = async () => {
    setLocationState('requesting');
    try {
      setUserLocation(await requestTelegramLocation());
      setLocationState('granted');
    } catch {
      setLocationState('denied');
    }
  };

  const handleSelect = async (value: CitySuggestion | null) => {
    if (!value) {
      return;
    }

    setSelectedCity(value);
    setQuery(value.label);
    setSaveState('saving');

    try {
      await api.saveLocation({
        telegramId,
        city: value.city,
        state: value.state,
        country: value.country,
        latitude: value.latitude,
        longitude: value.longitude,
      });
      onCitySelected(value);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const showEmptyState = !loading && debouncedQuery.length >= 2 && suggestions.length === 0;

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={locationState === 'requesting'}
        onClick={() => void requestLocationAccess()}
      >
        {t.common.searchCity} · GPS
      </button>
      {locationState === 'granted' ? (
        <p className="mb-3 text-xs" style={{ color: 'var(--brand-success)' }}>
          {t.citySearch.locationGranted}
        </p>
      ) : null}
      {locationState === 'denied' ? (
        <p className="mb-3 text-xs" style={{ color: 'var(--brand-warning)' }}>
          {t.citySearch.locationDenied}
        </p>
      ) : null}
      {locationState === 'error' ? (
        <p className="mb-3 text-xs" style={{ color: '#DC2626' }}>
          {locationErrorMessage ?? t.citySearch.locationUnsupported}
        </p>
      ) : null}

      <Combobox value={selectedCity} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            className="h-[52px] w-full rounded-[14px] border px-4 text-[15px] outline-none placeholder:text-[var(--theme-input-placeholder)]"
            displayValue={(item: CitySuggestion | null) => item?.label ?? query}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            name="qahal-city-search"
            style={{
              borderColor: 'var(--theme-input-border)',
              background: 'var(--theme-input-bg)',
              boxShadow: 'var(--theme-card-shadow)',
              color: 'var(--theme-input-text)',
            }}
            // Browsers may ignore autocomplete="off" for text fields; this helps suppress history autofill.
            autoSave="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setSaveState('idle');
              if (selectedCity) {
                setSelectedCity(null);
              }
            }}
            autoFocus
            placeholder={t.common.searchCity}
          />

          <ComboboxOptions
            className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border p-2"
            style={{
              borderColor: 'var(--theme-card-border)',
              background: 'var(--theme-card-bg)',
              boxShadow: 'var(--theme-card-shadow)',
            }}
          >
            {loading ? (
              <div className="px-3 py-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {t.common.searchingCities}
              </div>
            ) : null}

            {!loading
              ? suggestions.map((option) => (
                  <ComboboxOption
                    key={`${option.city}-${option.state}-${option.country}-${option.latitude}-${option.longitude}`}
                    value={option}
                    className="group cursor-pointer rounded-xl px-3 py-2 text-sm data-[focus]:bg-brand-purple/10"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </ComboboxOption>
                ))
              : null}

            {showEmptyState ? (
              <div className="px-3 py-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {t.common.noMatchingCities}
              </div>
            ) : null}
          </ComboboxOptions>
        </div>
      </Combobox>

      {saveState === 'saving' ? (
        <p className="mt-3 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
          {t.citySearch.saveInProgress}
        </p>
      ) : null}
      {saveState === 'error' ? (
        <p className="mt-3 text-xs" style={{ color: '#DC2626' }}>
          {t.citySearch.saveFailed}
        </p>
      ) : null}
      {saveState === 'saved' && selectedCity ? (
        <div
          className="mt-3 rounded-xl border px-3 py-3"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.28)',
            background: 'rgba(16, 185, 129, 0.12)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--brand-success)' }}>
            {t.citySearch.saveSuccess}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
            {selectedCity.city}, {selectedCity.state}, {selectedCity.country}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--brand-success)' }}>
            {t.citySearch.continueHint}
          </p>
        </div>
      ) : null}
    </div>
  );
};
