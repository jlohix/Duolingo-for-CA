import {
  authenticateStudent,
  setInitialPassword,
  verifyStudentMatric,
  resetPasswordWithMatric,
} from "../supabaseClient";

const ADMIN_USER = {
  username: "admin",
  password: "meowmeow",
  role: "admin",
};

const ADMIN_EMAILS = new Set([
  "faizah002@e.ntu.edu.sg",
  "tohj0044@e.ntu.edu.sg",
  "sean0072@e.ntu.edu.sg",
  "naka0002@e.ntu.edu.sg",
  "suny0086@e.ntu.edu.sg",
  "jloh063@e.ntu.edu.sg",
]);

const STORAGE_KEY = "circuito-session-v1";
export const MIN_PASSWORD_LENGTH = 8;

export function isStaffUsername(username) {
  const name = String(username || "").trim().toLowerCase();
  return name === ADMIN_USER.username || ADMIN_EMAILS.has(name);
}

function withRole(data) {
  const username = data.username;
  const role = isStaffUsername(username) ? "admin" : "student";
  return { username, role };
}

function roleFor(username) {
  return isStaffUsername(username) ? "admin" : "student";
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.username) return withRole(data);
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSession(session) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      username: session.username,
      role: session.role,
    })
  );
}

export function passwordError(newPassword, confirm, matricNumber) {
  const password = String(newPassword || "").trim();
  const repeat = String(confirm || "").trim();
  const matric = String(matricNumber || "").trim();
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 72) {
    return "Use 72 characters or fewer.";
  }
  if (matric && password === matric) {
    return "Do not use your matriculation number as the password.";
  }
  if (password !== repeat) {
    return "Those passwords do not match.";
  }
  return "";
}

export async function login(username, password) {
  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedPassword = String(password).trim();

  if (
    normalizedUsername === ADMIN_USER.username &&
    normalizedPassword === ADMIN_USER.password
  ) {
    const session = {
      username: ADMIN_USER.username,
      role: ADMIN_USER.role,
    };
    saveSession(session);
    return session;
  }

  if (!normalizedUsername.endsWith("@e.ntu.edu.sg")) return null;

  const authorized = await authenticateStudent(
    normalizedUsername,
    normalizedPassword
  );
  if (!authorized.ok) return null;

  const session = {
    username: normalizedUsername,
    role: roleFor(normalizedUsername),
    mustSetPassword: Boolean(authorized.mustSetPassword),
  };
  if (!session.mustSetPassword) saveSession(session);
  return session;
}

export async function finishFirstPassword(email, matricNumber, newPassword) {
  const ok = await setInitialPassword(email, matricNumber, newPassword);
  if (!ok) return null;
  const username = String(email).trim().toLowerCase();
  const session = {
    username,
    role: roleFor(username),
  };
  saveSession(session);
  return session;
}

export async function verifyForgotMatric(email, matricNumber) {
  const username = String(email || "").trim().toLowerCase();
  const matric = String(matricNumber || "").trim();
  if (!username.endsWith("@e.ntu.edu.sg") || !matric) return false;
  return verifyStudentMatric(username, matric);
}

export async function finishForgotPassword(email, matricNumber, newPassword) {
  const username = String(email || "").trim().toLowerCase();
  const matric = String(matricNumber || "").trim();
  if (!username.endsWith("@e.ntu.edu.sg")) return null;
  const ok = await resetPasswordWithMatric(username, matric, newPassword);
  if (!ok) return null;
  const session = {
    username,
    role: roleFor(username),
  };
  saveSession(session);
  return session;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdmin(session) {
  return session?.role === "admin" || isStaffUsername(session?.username);
}
