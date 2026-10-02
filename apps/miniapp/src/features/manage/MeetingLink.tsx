import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useI18n } from '../../app/i18n';
import { redesignCopy } from '../../app/i18n/redesign';
export function MeetingLink({
  communityId,
  telegramId,
  editable = false,
}: {
  communityId: number;
  telegramId: number;
  editable?: boolean;
}) {
  const { languageCode } = useI18n();
  const copy = redesignCopy(languageCode);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = () => {
    setError(false);
    api
      .getMeeting(communityId, telegramId)
      .then((value) => setLink(value.link ?? ''))
      .catch(() => setError(true));
  };
  useEffect(load, [communityId, telegramId]);
  return (
    <section className="redesign-card">
      {editable && link !== null ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(false);
            try {
              await api.setMeeting(communityId, { telegramId, link });
            } catch {
              setError(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            {copy.meetingLink}
            <input
              className="w-full p-2"
              style={{ background: 'var(--theme-input-bg)', color: 'var(--theme-input-text)' }}
              type="url"
              maxLength={2048}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </label>
          <p className="text-sm">{copy.memberOnly}</p>
          <button disabled={busy}>{copy.save}</button>
        </form>
      ) : link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {copy.meetingLink}
        </a>
      ) : (
        <p>{link === null ? copy.loading : copy.noMeetingLink}</p>
      )}
      {error && (
        <p role="alert">
          {copy.error} <button onClick={load}>{copy.retry}</button>
        </p>
      )}
    </section>
  );
}
