import { useEffect } from "react";
import { startModuleTimer } from "../state/moduleTimer";

/**
 * Tracks which module the logged-in user is in and how long they stay,
 * logging each visit to Supabase (module_visits via log_module_visit RPC).
 *
 * A fresh visit starts whenever the module identity changes (moduleKey or
 * moduleDetail), and the previous visit is stopped + flushed. Passing a
 * falsy email or moduleKey disables tracking (e.g. admins, or transient
 * screens you don't want to record).
 *
 * @param {object} params
 * @param {string|null|undefined} params.email      logged-in email (falsy = off)
 * @param {string|null|undefined} params.moduleKey  stable screen/module key (falsy = off)
 * @param {string} [params.moduleDetail]            finer detail (e.g. lesson key)
 * @param {string} [params.moduleLabel]             human label for reports
 * @param {string} [params.classId]                 class id, for reporting
 * @param {string} [params.sessionId]               parent session id (optional link)
 */
export function useModuleTime({
  email,
  moduleKey,
  moduleDetail = "",
  moduleLabel = "",
  classId = "",
  sessionId = null,
} = {}) {
  useEffect(() => {
    if (!email || !moduleKey) return undefined;
    const timer = startModuleTimer({
      email,
      moduleKey,
      moduleDetail,
      moduleLabel,
      classId,
      sessionId,
    });
    return () => timer.stop();
    // Restart on module identity change. classId/label/sessionId are read
    // at start; that's sufficient for engagement reporting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, moduleKey, moduleDetail]);
}
