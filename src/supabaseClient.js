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
