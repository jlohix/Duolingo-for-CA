// Default avatar shown for any user who has not uploaded their own.
//
// To MASS-CHANGE the default for everyone (e.g. right before deployment):
//   - Easiest: replace the image file at this path (keep the filename), OR
//   - Change DEFAULT_AVATAR below to point at a different file in /public.
// Either way, every user without a custom avatar instantly shows the new one.
//
// (Files in /public are served from the site root, so "/mascot.png"
//  maps to public/mascot.png.)
export const DEFAULT_AVATAR = "/mascot.png";

// Resolve which avatar to show: the user's uploaded one, or the default.
export function avatarSrc(url) {
  const clean = String(url || "").trim();
  return clean || DEFAULT_AVATAR;
}

// True when the user has no uploaded avatar (i.e. we're showing the default).
// Used to style the default differently (fit whole image, no crop).
export function isDefaultAvatar(url) {
  return !String(url || "").trim();
}
