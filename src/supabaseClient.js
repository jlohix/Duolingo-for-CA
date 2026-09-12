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
