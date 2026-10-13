import { useEffect, useState } from "react";
import { HARDCODED_ANNOUNCEMENT } from "../data/hardcodedAnnouncement";

// A persistent, offline-safe announcement banner driven entirely by
// src/data/hardcodedAnnouncement.js (no Supabase). Shows at the top of the app
// for logged-in users. Dismissible for the current page view, but it is NOT
// permanently hidden (reappears on reload) because it's meant for critical
// outage notices. Renders nothing when disabled.
export default function HardcodedBanner() {
  const [hidden, setHidden] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const a = HARDCODED_ANNOUNCEMENT;

  // Close the zoom view with the Escape key.
  useEffect(() => {
    if (!zoomed) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!a?.enabled || hidden) return null;

  return (
    <>
      <div className="hardcoded-banner" role="alert">
        {a.imageSrc ? (
          <button
            type="button"
            className="hardcoded-banner-thumb"
            onClick={() => setZoomed(true)}
            aria-label="Enlarge example screenshot"
            title="Click to enlarge"
          >
            <img className="hardcoded-banner-img" src={a.imageSrc} alt="Example completion page" />
            <span className="hardcoded-banner-zoom" aria-hidden="true">🔍</span>
          </button>
        ) : null}
        <div className="hardcoded-banner-text">
          {a.title ? <strong>{a.title}</strong> : null}
          {a.description ? <span>{a.description}</span> : null}
          {a.note ? <em className="hardcoded-banner-note">{a.note}</em> : null}
        </div>
        <button
          type="button"
          className="hardcoded-banner-close"
          aria-label="Dismiss"
          onClick={() => setHidden(true)}
        >
          ✕
        </button>
      </div>

      {zoomed && a.imageSrc ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Example completion page"
          onClick={() => setZoomed(false)}
        >
          <img
            className="image-lightbox-img"
            src={a.imageSrc}
            alt="Example completion page"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="image-lightbox-close"
            aria-label="Close"
            onClick={() => setZoomed(false)}
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
