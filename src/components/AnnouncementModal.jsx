import { useEffect, useState } from "react";
import {
  markAnnouncementsSeen,
  loadAnnouncementsForPopup,
} from "../state/announcements";
import { DEFAULT_ACCENT, textOn } from "../data/announcementColors";

// Turn a plain-text description into React nodes where any http(s) URL becomes
// a clickable link (opens in a new tab). Safe: we render real text + <a> nodes,
// never raw HTML, so there's no injection risk. A trailing "." or "," etc. that
// commonly follows a URL in prose is kept out of the link.
const URL_RE = /(https?:\/\/[^\s]+)/g;

function linkifyDescription(text) {
  const str = String(text || "");
  const parts = str.split(URL_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const m = part.match(/^(.*?)([.,!?;:)\]]*)$/);
      const url = m ? m[1] : part;
      const trail = m ? m[2] : "";
      return (
        <span key={i}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          {trail}
        </span>
      );
    }
    return part;
  });
}

// Self-contained gate: fetches the active announcements for a logged-in student
// and shows the pop-up once per login session. Mounted at the app root; renders
// nothing until there is something to show.
//   email           - the logged-in student's email (null when not applicable)
//   enabled         - only fetch when true (student, consent cleared, etc.)
export function AnnouncementGate({ email, enabled }) {
  const [items, setItems] = useState([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Reset when the user/enabled state changes (e.g. new login).
    setItems([]);
    setShown(false);
    if (!enabled || !email) return;
    let cancelled = false;
    loadAnnouncementsForPopup().then((list) => {
      if (!cancelled && list.length > 0) {
        setItems(list);
        setShown(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email, enabled]);

  if (!shown) return null;
  return <AnnouncementModal items={items} onClose={() => setShown(false)} />;
}

// Dismissible login pop-up that stacks all active announcements in one sheet.
// `items` is the array of active announcements (newest first). `onClose` is
// called after the student dismisses; we also record "once" dismissals so they
// don't reappear in this browser.
export default function AnnouncementModal({ items, onClose }) {
  if (!items || items.length === 0) return null;

  function dismiss() {
    try {
      markAnnouncementsSeen(items.map((a) => a.id));
    } catch {
      /* ignore */
    }
    onClose?.();
  }

  return (
    <div className="overlay announcement-overlay" role="presentation" onClick={dismiss}>
      <div
        className="event-sheet announcement-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow" id="announcement-heading">
          {items.length > 1 ? "Announcements" : "Announcement"}
        </p>

        <div className="announcement-list">
          {items.map((a) => {
            const accent = a.color || DEFAULT_ACCENT;
            return (
            <article
              key={a.id}
              className="announcement-item"
              style={{ borderLeftColor: accent }}
            >
              <h2
                className="announcement-title"
                style={{ background: accent, color: textOn(accent) }}
              >
                {a.title}
              </h2>
              {a.image_url ? (
                <img
                  className="announcement-image"
                  src={a.image_url}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              {a.description ? (
                <p className="announcement-desc">
                  {linkifyDescription(a.description)}
                </p>
              ) : null}
            </article>
            );
          })}
        </div>

        <button type="button" className="primary announcement-dismiss" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
