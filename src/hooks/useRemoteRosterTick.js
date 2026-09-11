import { useSyncExternalStore } from "react";
import {
  getRemoteRosterEpoch,
  subscribeRemoteRoster,
} from "../state/remoteRoster";

/** Re-render when classmate progress is refreshed from Supabase. */
export function useRemoteRosterTick() {
  return useSyncExternalStore(
    subscribeRemoteRoster,
    getRemoteRosterEpoch,
    () => 0
  );
}
