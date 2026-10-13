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
  title: "Troubles saving XP",
  description:
    "After every lesson you complete, please take a screenshot of the completion page. Currently, our database is experiencing some issues so your progress (including XP) may not be saved after completion.",
  // Shown in italics/emphasis under the description.
  note:
    "Ensure your screenshot captures the entire screen, including your email and timestamp at the bottom left corner.",
  // Bundled image from public/ — loads offline (works during a Supabase outage).
  imageSrc: "/completion_page.png",
};
