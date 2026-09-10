const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // These come from your local .env file (see .env.example).
  // If you see this error, create a .env file in the project root with
  // VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart `npm run dev`.
  throw new Error(
    "Missing Supabase config. Copy .env.example to .env and fill in " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

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
    throw new Error("The student login service is unavailable.");
  }
  return response.json();
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
