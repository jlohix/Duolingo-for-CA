import { useEffect } from "react";
import { startSessionTimer } from "../state/sessionTimer";

/**
 * Tracks how long the logged-in user spends on the site and logs the
 * duration to Supabase (session_times table via log_session_time RPC).
 *
 * A new timing session starts when a user logs in / the app mounts with
 * a session, and is stopped + flushed on logout or unmount.
 *
 * @param {string|null|undefined} email    logged-in user's email (falsy = not tracked)
 * @param {string} [classId]               current class id, for reporting context
 */
export function useSessionTime(email, classId = "") {
  useEffect(() => {
    if (!email) return undefined;
    const timer = startSessionTimer({ email, classId });
    return () => timer.stop();
    // Restart the timing session when the user changes. classId is passed
    // by value at start; live class changes are captured on the next login
    // or reload, which is sufficient for engagement reporting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
}
