import React, { useState, useEffect } from 'react';

/**
 * GuestbookLive — listado del libro de visitas (comando `guestbook`).
 * Las firmas se hacen con `guestbook sign <mensaje>` desde la terminal.
 */

interface Entry {
  name: string;
  message: string;
  ts: number;
}

const TEAL = '#94e2d5';
const TEXT = '#cdd6f4';
const FAINT = '#6c7086';
const GREEN = '#a6e3a1';
const RED = '#f38ba8';

export const GuestbookLive: React.FC = () => {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/v1/guestbook')
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <div style={{ color: RED }}>guestbook: Edge API unreachable.</div>;
  if (entries === null) return <div style={{ color: FAINT }}>Reading /data/guestbook.db...</div>;

  return (
    <div className="my-1">
      <div style={{ color: TEAL }} className="font-bold">
        📖 GUESTBOOK — last {entries.length} signatures
      </div>
      {entries.length === 0 ? (
        <div style={{ color: FAINT }}>No signatures yet. Be the first: guestbook sign &lt;message&gt;</div>
      ) : (
        entries.map((e, i) => (
          <div key={i}>
            <span style={{ color: FAINT }}>
              {new Date(e.ts * 1000).toISOString().slice(0, 10)}{' '}
            </span>
            <span style={{ color: GREEN }}>{e.name}</span>
            <span style={{ color: FAINT }}>: </span>
            <span style={{ color: TEXT }}>{e.message}</span>
          </div>
        ))
      )}
      <div style={{ color: FAINT }} className="text-xs mt-1">
        sign it: guestbook sign &lt;your message&gt;
      </div>
    </div>
  );
};
