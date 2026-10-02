import { MeetingLink } from '../manage/MeetingLink';
import { useEffect, useState } from 'react';
import type { CitySuggestion, CommunityCard, DiscoveryResponse } from '@qahal/shared';
import type { EffectiveProfileSnapshot, HomeVariant } from '../../app/types';
import { useI18n } from '../../app/i18n';
import { redesignCopy } from '../../app/i18n/redesign';
import { api } from '../../lib/api';
import { CitySearch } from '../onboarding/CitySearch';
import { requestTelegramLocation, hapticSuccess } from '../../lib/telegram';

interface HomeScreenProps {
  telegramId: number;
  city: string;
  latitude?: number;
  longitude?: number;
  onAreaChange: (city: CitySuggestion) => void;
  variant: HomeVariant;
  communities: CommunityCard[];
  onVariantChange: (variant: HomeVariant) => void;
  onGoMap: () => void;
  onGoProfile: () => void;
  onGoManageQahal: () => void;
  profileTestingEnabled: boolean;
  effectiveProfile: EffectiveProfileSnapshot;
}
export function HomeScreen(props: HomeScreenProps) {
  const { languageCode } = useI18n();
  const copy = redesignCopy(languageCode);
  const [type, setType] = useState<'in_person' | 'online'>('in_person');
  const [radius, setRadius] = useState(25);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [createType, setCreateType] = useState<'in_person' | 'online'>('in_person');
  const hasArea = props.latitude !== undefined && props.longitude !== undefined;
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setError(false);
    if (type === 'in_person' && !hasArea) return;
    const params = new URLSearchParams({ type, radiusKm: String(radius), page: String(page) });
    if (hasArea) {
      params.set('latitude', String(props.latitude));
      params.set('longitude', String(props.longitude));
    }
    api
      .discovery(params)
      .then((value) => {
        if (!cancelled) setResult(value);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [type, radius, page, revision, hasArea, props.latitude, props.longitude]);
  async function action(run: () => Promise<unknown>) {
    setBusy(true);
    setActionError(false);
    try {
      await run();
      hapticSuccess();
      setRevision((v) => v + 1);
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="redesign-screen" dir={languageCode === 'he' ? 'rtl' : 'ltr'}>
      <h1 className="qahal-display text-3xl">Qahal</h1>
      <div role="tablist" aria-label="Qahal">
        <button
          role="tab"
          aria-selected={type === 'in_person'}
          onClick={() => {
            setType('in_person');
            setPage(0);
          }}
        >
          {copy.local}
        </button>
        <button
          role="tab"
          aria-selected={type === 'online'}
          onClick={() => {
            setType('online');
            setPage(0);
          }}
        >
          {copy.online}
        </button>
      </div>
      {type === 'in_person' && (
        <section className="redesign-card">
          <h2>{copy.area}</h2>
          <CitySearch
            telegramId={props.telegramId}
            initialValue={props.city}
            onCitySelected={(city) => {
              props.onAreaChange(city);
              setCountry(city.country);
              setPage(0);
            }}
          />
          <button
            disabled={busy}
            onClick={() =>
              void action(async () => {
                try {
                  const location = await requestTelegramLocation();
                  await api.upsertLocation({ telegramId: props.telegramId, ...location });
                  props.onAreaChange({
                    ...location,
                    city: props.city,
                    state: '',
                    country: '',
                    label: props.city,
                  });
                  setLocationError(false);
                  setPage(0);
                } catch {
                  setLocationError(true);
                }
              })
            }
          >
            {copy.location}
          </button>
          {locationError && <p role="status">{copy.locationFailed}</p>}
          <label>
            {copy.radius}
            <select
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                setPage(0);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} km
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm">{copy.approximate}</p>
        </section>
      )}
      {error ? (
        <section role="alert">
          <p>{copy.error}</p>
          <button onClick={() => setRevision((v) => v + 1)}>{copy.retry}</button>
        </section>
      ) : !result ? (
        (type === 'online' || hasArea) && <p role="status">{copy.loading}</p>
      ) : (
        <section aria-live="polite">
          {result.communities.map((community) => (
            <article key={community.id} className="redesign-card">
              <h2 className="text-xl">{community.name}</h2>
              <p>
                {community.type === 'online'
                  ? copy.online
                  : `${community.city ?? ''} · ~${community.distanceKm} km`}
              </p>
              {community.canManage ? (
                <button onClick={props.onGoManageQahal}>{copy.manage}</button>
              ) : (
                <button
                  disabled={busy || community.memberState !== 'not_member'}
                  onClick={() => void action(() => api.requestJoin(community.id, props.telegramId))}
                >
                  {community.memberState === 'member'
                    ? copy.member
                    : community.memberState === 'requested'
                      ? copy.requested
                      : copy.join}
                </button>
              )}
              {community.memberState === 'member' && (
                <MeetingLink communityId={community.id} telegramId={props.telegramId} />
              )}
            </article>
          ))}
          {result.communities.length === 0 && (
            <>
              <p>{type === 'online' ? copy.noOnline : copy.empty}</p>
              {type === 'in_person' && !result.people.length && <p>{copy.noPeople}</p>}
              {result.people.map((person) => (
                <article key={person.id} className="redesign-card">
                  <h2>{person.name}</h2>
                  <p>{person.area}</p>
                  {person.contactUrl && (
                    <a href={person.contactUrl} target="_blank" rel="noreferrer">
                      {copy.contact}
                    </a>
                  )}
                </article>
              ))}
            </>
          )}
          <div className="flex gap-2">
            {page > 0 && <button onClick={() => setPage((v) => v - 1)}>{copy.previous}</button>}
            {result.nextPage !== null && (
              <button onClick={() => setPage(result.nextPage!)}>{copy.next}</button>
            )}
          </div>
        </section>
      )}
      {actionError && <p role="alert">{copy.error}</p>}
      {props.effectiveProfile.canManageQahal && (
        <button onClick={props.onGoManageQahal}>{copy.manage}</button>
      )}
      {props.effectiveProfile.canCreateQahal && (
        <button onClick={() => setCreating((v) => !v)}>{copy.create}</button>
      )}
      {creating && (
        <form
          className="redesign-card"
          onSubmit={(e) => {
            e.preventDefault();
            void action(async () => {
              await api.createCommunity(
                createType === 'online'
                  ? { telegramId: props.telegramId, name, type: 'online' }
                  : {
                      telegramId: props.telegramId,
                      name,
                      type: 'in_person',
                      city: props.city,
                      country,
                      latitude: props.latitude!,
                      longitude: props.longitude!,
                    },
              );
              setCreating(false);
              props.onGoManageQahal();
            });
          }}
        >
          <label>
            {copy.name}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </label>
          <select
            aria-label={copy.create}
            value={createType}
            onChange={(e) => setCreateType(e.target.value as typeof createType)}
          >
            <option value="in_person">{copy.inPerson}</option>
            <option value="online">{copy.online}</option>
          </select>
          {createType === 'in_person' && (
            <>
              <p>{props.city || copy.area}</p>
              <label>
                {copy.country}
                <input required value={country} onChange={(e) => setCountry(e.target.value)} />
              </label>
            </>
          )}
          <button disabled={busy || (createType === 'in_person' && (!hasArea || !props.city))}>
            {copy.save}
          </button>
        </form>
      )}
      <nav className="redesign-nav">
        <button aria-current="page">{copy.home}</button>
        <button onClick={props.onGoProfile}>{copy.profile}</button>
      </nav>
    </main>
  );
}
