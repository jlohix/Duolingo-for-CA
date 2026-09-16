const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://qucqtavvoabgxlvlpobp.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_65cJaPpvDhrCdABzLcrADg_FCHY3nZl";

function rpcHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

async function rpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: rpcHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      /* ignore */
    }
    const err = new Error(
      detail
        ? `The student login service is unavailable. (${detail})`
        : "The student login service is unavailable."
    );
    err.status = response.status;
    throw err;
  }
  // empty body
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export function parseAuthResult(data) {
  if (data === true) return { ok: true, mustSetPassword: false };
  if (data === false || data == null) return { ok: false, mustSetPassword: false };
  if (typeof data === "object") {
    return {
      ok: Boolean(data.authenticated ?? data.ok),
      mustSetPassword: Boolean(
        data.must_set_password ?? data.mustSetPassword
      ),
    };
  }
  return { ok: false, mustSetPassword: false };
}

export async function authenticateStudent(email, secret) {
  const data = await rpc("authenticate_student", {
    p_email: email,
    p_matric_number: secret,
  });
  return parseAuthResult(data);
}

export async function setInitialPassword(email, matricNumber, newPassword) {
  const data = await rpc("set_initial_password", {
    p_email: email,
    p_matric_number: matricNumber,
    p_new_password: newPassword,
  });
  return data === true;
}

export async function verifyStudentMatric(email, matricNumber) {
  const data = await rpc("verify_student_matric", {
    p_email: String(email || "").trim().toLowerCase(),
    p_matric_number: String(matricNumber || "").trim(),
  });
  return data === true;
}

export async function resetPasswordWithMatric(email, matricNumber, newPassword) {
  const data = await rpc("reset_password_with_matric", {
    p_email: String(email || "").trim().toLowerCase(),
    p_matric_number: String(matricNumber || "").trim(),
    p_new_password: String(newPassword || "").trim(),
  });
  return data === true;
}

export async function getStudentProgress(email) {
  const data = await rpc("get_student_progress", {
    p_email: String(email || "").trim().toLowerCase(),
  });
  return data && typeof data === "object" ? data : null;
}

export async function upsertStudentProgress(email, progressPayload) {
  const data = await rpc("upsert_student_progress", {
    p_email: String(email || "").trim().toLowerCase(),
    p_data: progressPayload,
  });
  return data === true;
}

export async function listStudentProgress() {
  const data = await rpc("list_student_progress", {});
  return Array.isArray(data) ? data : [];
}

// ---------- Session time tracking ----------

// Upsert the running duration for one browsing session. Called on start,
// on periodic heartbeat, and on final flush when the user leaves. The
// server keeps the largest duration it has seen for the session.
export async function logSessionTime({
  sessionId,
  email,
  durationSeconds,
  classId = "",
  userAgent = "",
}) {
  const data = await rpc("log_session_time", {
    p_session_id: String(sessionId || ""),
    p_email: String(email || "").trim().toLowerCase(),
    p_duration_seconds: Math.max(0, Math.round(Number(durationSeconds) || 0)),
    p_class_id: String(classId || ""),
    p_user_agent: String(userAgent || ""),
  });
  return data === true;
}

// Fire-and-forget flush that survives the page being closed. Uses
// navigator.sendBeacon when available (works during unload), and falls
// back to a keepalive fetch. Safe to call from visibilitychange/pagehide.
export function logSessionTimeBeacon({
  sessionId,
  email,
  durationSeconds,
  classId = "",
  userAgent = "",
}) {
  const payload = {
    p_session_id: String(sessionId || ""),
    p_email: String(email || "").trim().toLowerCase(),
    p_duration_seconds: Math.max(0, Math.round(Number(durationSeconds) || 0)),
    p_class_id: String(classId || ""),
    p_user_agent: String(userAgent || ""),
  };
  const url = `${SUPABASE_URL}/rest/v1/rpc/log_session_time`;

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      // sendBeacon can't set custom headers, so pass the apikey as a query
      // param (PostgREST accepts it) and send a typed JSON blob.
      const beaconUrl = `${url}?apikey=${encodeURIComponent(SUPABASE_ANON_KEY)}`;
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      if (navigator.sendBeacon(beaconUrl, blob)) return true;
    }
  } catch {
    /* fall through to keepalive fetch */
  }

  try {
    fetch(url, {
      method: "POST",
      headers: rpcHeaders(),
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

// Staff-facing read of all logged session times (sorted by user, then start).
export async function listSessionTimes() {
  const data = await rpc("list_session_times", {});
  return Array.isArray(data) ? data : [];
}

export async function syncLeagueSeasonRemote() {
  const data = await rpc("sync_league_season", {});
  return data && typeof data === "object" ? data : null;
}

// ---------- Question reports ----------

export async function submitQuestionReportRemote({
  questionId,
  questionText,
  reason,
  note,
  reporter,
}) {
  const data = await rpc("submit_question_report", {
    p_question_id: String(questionId || "").trim(),
    p_question_text: String(questionText || ""),
    p_reason: String(reason || "").trim(),
    p_note: String(note || "").trim(),
    p_reporter: String(reporter || "").trim().toLowerCase(),
  });
  return data === true;
}

export async function listQuestionReportsRemote() {
  const data = await rpc("list_question_reports", {});
  return Array.isArray(data) ? data : [];
}

export async function getStudentConsentStatus(email) {
  const data = await rpc("get_student_consent_status", {
    p_email: String(email || "").trim().toLowerCase(),
  });
  if (!data || typeof data !== "object") {
    return { recorded: false, research_opt_in: false };
  }
  return {
    recorded: Boolean(data.recorded),
    research_opt_in: Boolean(data.research_opt_in),
  };
}

export async function recordStudentConsent(email, answers) {
  const data = await rpc("record_student_consent", {
    p_email: String(email || "").trim().toLowerCase(),
    p_answers: answers,
  });
  return data === true;
}

export async function resolveQuestionReportRemote(id, resolved) {
  const data = await rpc("resolve_question_report", {
    p_id: id,
    p_resolved: Boolean(resolved),
  });
  return data === true;
}

// ---------- Avatar uploads (Supabase Storage: public "avatars" bucket) ----------

const AVATAR_BUCKET = "avatars";

// Turn an email into a safe storage filename (ownership by convention:
// the app always uploads under the logged-in user's own email).
function avatarPathForEmail(email) {
  const safe = String(email || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${safe || "user"}.png`;
}

// Upload a Blob to the avatars bucket and return the public URL.
// Uses upsert so re-uploading replaces the user's previous avatar.
export async function uploadAvatar(email, blob) {
  const path = avatarPathForEmail(email);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": blob.type || "image/png",
        "x-upsert": "true",
      },
      body: blob,
    }
  );
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      detail ? `Avatar upload failed. (${detail})` : "Avatar upload failed."
    );
  }
  // Public URL for a public bucket. Cache-bust so the new image shows immediately.
  return `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${path}?v=${Date.now()}`;
}


// ---------- RAG tutor chatbot (Supabase Edge Function: "chat") ----------

// Max prior turns (messages) of conversation history to send along. A "turn"
// is one message, so 8 turns ≈ 4 back-and-forth exchanges. Keeps requests
// small/fast/cheap; the Edge Function also enforces this cap defensively.
export const CHAT_HISTORY_LIMIT = 8;

// Send a question (plus recent conversation history) to the deployed `chat`
// Edge Function and return the grounded answer plus the lecture weeks it drew
// from. `history` is an array of prior turns: [{ role: "user"|"model", text }].
// Resolves to { answer, sources }. Throws with a friendly message on failure.
export async function askChatbot(question, history = []) {
  const trimmed = String(question || "").trim();
  if (!trimmed) {
    throw new Error("Please type a question first.");
  }

  // Normalize + cap the history to the most recent turns before sending.
  const safeHistory = (Array.isArray(history) ? history : [])
    .filter(
      (t) =>
        t &&
        (t.role === "user" || t.role === "model") &&
        typeof t.text === "string" &&
        t.text.trim()
    )
    .map((t) => ({ role: t.role, text: t.text.trim() }))
    .slice(-CHAT_HISTORY_LIMIT);

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: trimmed, history: safeHistory }),
    });
  } catch {
    throw new Error("Couldn't reach the tutor. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const detail = data && data.error ? data.error : `HTTP ${response.status}`;
    throw new Error(`The tutor is unavailable right now. (${detail})`);
  }

  if (data && data.error) {
    throw new Error(data.error);
  }

  return {
    answer: (data && data.answer) || "",
    sources: Array.isArray(data && data.sources) ? data.sources : [],
  };
}
