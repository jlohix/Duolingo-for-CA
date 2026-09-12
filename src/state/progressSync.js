import {
  getStudentProgress,
  upsertStudentProgress,
  listStudentProgress,
} from "../supabaseClient";
import {
  loadProgress,
  saveProgress,
  progressToRemotePayload,
  remotePayloadToProgress,
  setProgressOwner,
} from "./progress";
import {
  setRemoteStudentCache,
  refreshRemoteStudents,
} from "./remoteRoster";

const PUSH_DEBOUNCE_MS = 700;
let pushTimer = null;
let pushOwner = "";

function hasMeaningfulProgress(state) {
  if (!state) return false;
  if (state.classChosen) return true;
  if (Number(state.xp) > 0) return true;
  if (Number(state.streak) > 0) return true;
  if ((state.completed || []).length > 0) return true;
  if (Object.keys(state.topicStats || {}).length > 0) return true;
  if (String(state.displayName || "").trim()) return true;
  return false;
}

export async function hydrateProgressForUser(session) {
  const email = String(session?.username || "").trim().toLowerCase();
  if (!email || session?.role === "admin" || email === "admin") {
    setProgressOwner(null);
    return loadProgress();
  }

  setProgressOwner(email);
  const local = loadProgress(email);

  let remote = null;
  try {
    remote = await getStudentProgress(email);
  } catch {
    remote = null;
  }

  const remoteState = remote ? remotePayloadToProgress(remote) : null;

  // The class is ASSIGNED by staff (authorised_users) and returned by the
  // backend. It is authoritative: whichever progress state we end up using
  // (local or remote), the assigned class must win over any old local value.
  // remoteState carries the assigned class + classChosen from get_student_progress.
  function withAssignedClass(state) {
    if (!state || !remoteState) return state;
    return {
      ...state,
      classId: remoteState.classId,
      classChosen: remoteState.classChosen,
    };
  }

  if (remoteState && hasMeaningfulProgress(remoteState)) {
    const localAhead =
      hasMeaningfulProgress(local) &&
      ((Number(local.xp) || 0) > (Number(remoteState.xp) || 0) ||
        ((Number(local.xp) || 0) === (Number(remoteState.xp) || 0) &&
          (local.completed || []).length >
            (remoteState.completed || []).length));
    if (localAhead) {
      const merged = withAssignedClass(local);
      try {
        await upsertStudentProgress(email, progressToRemotePayload(merged));
      } catch {
        /* keep local */
      }
      saveProgress(merged, email);
      return merged;
    }
    saveProgress(remoteState, email);
    return remoteState;
  }

  if (hasMeaningfulProgress(local)) {
    const merged = withAssignedClass(local);
    try {
      await upsertStudentProgress(email, progressToRemotePayload(merged));
    } catch {
      /* keep local; retry on later saves */
    }
    saveProgress(merged, email);
    return merged;
  }

  if (remoteState) {
    saveProgress(remoteState, email);
    return remoteState;
  }

  return local;
}

export function scheduleProgressPush(session, state) {
  const email = String(session?.username || "").trim().toLowerCase();
  if (!email || session?.role === "admin" || email === "admin") return;
  if (!state) return;

  pushOwner = email;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    const owner = pushOwner;
    try {
      const ok = await upsertStudentProgress(
        owner,
        progressToRemotePayload(state)
      );
      if (!ok) {
        console.warn(
          "[circuito] progress sync returned false for",
          owner,
          "(email must exist in authorised_users)"
        );
        return;
      }
      await refreshRemoteStudents();
    } catch (err) {
      console.warn("[circuito] progress sync failed", err);
    }
  }, PUSH_DEBOUNCE_MS);
}

export async function flushProgressPush(session, state) {
  const email = String(session?.username || "").trim().toLowerCase();
  if (!email || session?.role === "admin" || email === "admin") return false;
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  try {
    const ok = await upsertStudentProgress(
      email,
      progressToRemotePayload(state)
    );
    if (!ok) {
      console.warn(
        "[circuito] progress flush returned false for",
        email,
        "(email must exist in authorised_users)"
      );
      return false;
    }
    await refreshRemoteStudents();
    return true;
  } catch (err) {
    console.warn("[circuito] progress flush failed", err);
    return false;
  }
}

export async function bootstrapRemoteRoster() {
  try {
    const rows = await listStudentProgress();
    setRemoteStudentCache(rows);
    return rows;
  } catch {
    setRemoteStudentCache([]);
    return [];
  }
}
