// ---------------------------------------------------------------------------
// HARDCODED announcement — shipped in the app, works even when Supabase is DOWN.
// ---------------------------------------------------------------------------
// Use this for critical notices that must show during an outage (e.g. "Supabase
// is having issues — screenshot your XP after each lesson"). Because it lives in
// the code, it does NOT depend on the database or network.
//
// TO TURN OFF:   set `enabled: false` below and redeploy (one line).
// TO EDIT:       change title / description / imageSrc below and redeploy.
// TO REMOVE:     delete this file and the <HardcodedBanner/> usage in App.jsx
//                (one import + one line). The Supabase-backed announcements
//                system keeps working on its own.
//
// IMAGE NOTE: imageSrc must be a BUNDLED/relative asset (e.g. "/mascot.png" from
// the public/ folder) so it loads during a Supabase outage. Do NOT point it at a
// Supabase Storage URL here, or it won't show when Supabase is down. Leave as
// "" for no image.

export const HARDCODED_ANNOUNCEMENT = {
  enabled: true,
  title: "Please screenshot your XP",
  description:
    "We're having some technical issues saving progress right now. After you finish each lesson, please take a screenshot of your XP page so your progress can be verified. Thank you!",
  imageSrc: "", // e.g. "/mascot.png" (from public/), or leave "" for no image
};
