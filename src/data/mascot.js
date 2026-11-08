export const MASCOT_SRC = "/mascot.png";
export const HALLOWEEN_MASCOT_SRC = "/mascot-halloween.png";

/** Witch-hat mascot from late October through 2 November. */
export function isHalloweenSeason(now = new Date()) {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 10 && day >= 24) return true;
  if (month === 11 && day <= 2) return true;
  return false;
}

export function mascotSrc(now = new Date()) {
  return isHalloweenSeason(now) ? HALLOWEEN_MASCOT_SRC : MASCOT_SRC;
}
