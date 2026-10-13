import { useEffect, useState } from "react";
import {
  markAnnouncementsSeen,
  loadAnnouncementsForPopup,
} from "../state/announcements";

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
          {items.map((a) => (
            <article key={a.id} className="announcement-item">
              <h2 className="announcement-title">{a.title}</h2>
              {a.image_url ? (
                <img
                  className="announcement-image"
                  src={a.image_url}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              {a.description ? (
                <p className="announcement-desc">{a.description}</p>
              ) : null}
            </article>
          ))}
        </div>

        <button type="button" className="primary announcement-dismiss" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
