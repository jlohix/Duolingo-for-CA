import { useState } from "react";
import { HARDCODED_ANNOUNCEMENT } from "../data/hardcodedAnnouncement";

// A persistent, offline-safe announcement banner driven entirely by
// src/data/hardcodedAnnouncement.js (no Supabase). Shows at the top of the app
// for logged-in users. Dismissible for the current page view, but it is NOT
// permanently hidden (reappears on reload) because it's meant for critical
// outage notices. Renders nothing when disabled.
export default function HardcodedBanner() {
  const [hidden, setHidden] = useState(false);
  const a = HARDCODED_ANNOUNCEMENT;

  if (!a?.enabled || hidden) return null;

  return (
    <div className="hardcoded-banner" role="alert">
      {a.imageSrc ? (
        <img className="hardcoded-banner-img" src={a.imageSrc} alt="" />
      ) : null}
      <div className="hardcoded-banner-text">
        {a.title ? <strong>{a.title}</strong> : null}
        {a.description ? <span>{a.description}</span> : null}
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
  );
}
