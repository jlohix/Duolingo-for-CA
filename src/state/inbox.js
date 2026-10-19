import {
  listInboxRemote,
  markInboxReadRemote,
  markInboxReadAllRemote,
  createInboxMessageRemote,
  listInboxAdminRemote,
  deleteInboxMessageRemote,
} from "../supabaseClient";

const READ_KEY = "circuito-inbox-read-v1";
const LOCAL_KEY = "circuito-inbox-local-v1";

function asEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function readSet(email) {
  const all = readJson(READ_KEY, {});
  const list = Array.isArray(all[asEmail(email)]) ? all[asEmail(email)] : [];
  return new Set(list.map(String));
}

function writeSet(email, ids) {
  const all = readJson(READ_KEY, {});
  all[asEmail(email)] = [...ids];
  writeJson(READ_KEY, all);
}

function localMessages() {
  const rows = readJson(LOCAL_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

function saveLocalMessages(rows) {
  writeJson(LOCAL_KEY, rows.slice(0, 80));
}

function visibleTo(row, email, classId) {
  const who = asEmail(email);
  const cls = String(classId || "").trim().toUpperCase();
  const recipient = asEmail(row.recipient);
  if (recipient) return recipient === who;
  const target = String(row.classId || row.class_id || "").trim().toUpperCase();
  return !target || target === cls;
}

function shape(row) {
  return {
    id: String(row.id || ""),
    kind: row.kind === "report_resolved" ? "report_resolved" : "assignment",
    title: String(row.title || "Notice"),
    body: String(row.body || ""),
    classId: String(row.classId || row.class_id || ""),
    recipient: asEmail(row.recipient),
    createdBy: String(row.createdBy || row.created_by || ""),
    createdAt: row.createdAt || row.created_at || "",
    read: Boolean(row.read),
  };
}

export function formatInboxWhen(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(ts);
  }
}

export async function loadInbox(email, classId) {
  const who = asEmail(email);
  if (!who) return [];
  let remote = [];
  try {
    remote = (await listInboxRemote(who, classId)).map(shape);
  } catch {
    remote = [];
  }
  const local = localMessages()
    .map(shape)
    .filter((row) => visibleTo(row, who, classId));
  const seen = new Set();
  const merged = [];
  for (const row of [...remote, ...local]) {
    if (!row.id || seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  const reads = readSet(who);
  return merged
    .map((row) => ({ ...row, read: row.read || reads.has(row.id) }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function markInboxRead(email, id) {
  const who = asEmail(email);
  if (!who || !id) return false;
  const reads = readSet(who);
  reads.add(String(id));
  writeSet(who, reads);
  try {
    await markInboxReadRemote(who, id);
  } catch {
    /* local flag still stands */
  }
  return true;
}

export async function markInboxAllRead(email, classId) {
  const who = asEmail(email);
  if (!who) return false;
  const items = await loadInbox(who, classId);
  const reads = readSet(who);
  items.forEach((row) => reads.add(row.id));
  writeSet(who, reads);
  try {
    await markInboxReadAllRemote(who, classId);
  } catch {
    /* local flag still stands */
  }
  return true;
}

export async function postAssignment({ title, body, classId, createdBy }) {
  const heading = String(title || "").trim();
  if (!heading) return { ok: false, error: "Enter a title." };
  const payload = {
    kind: "assignment",
    title: heading,
    body: String(body || "").trim(),
    classId: String(classId || "").trim().toUpperCase(),
    recipient: "",
    createdBy,
    sourceId: "",
  };
  try {
    const id = await createInboxMessageRemote(payload);
    if (id) return { ok: true, id };
  } catch {
    /* fall through */
  }
  const local = {
    id: `local-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
    read: false,
  };
  saveLocalMessages([local, ...localMessages()]);
  return { ok: true, id: local.id, local: true };
}

export async function loadAssignmentsAdmin() {
  try {
    const rows = (await listInboxAdminRemote()).map(shape);
    if (rows.length) return rows;
  } catch {
    /* local */
  }
  return localMessages()
    .map(shape)
    .filter((row) => row.kind === "assignment");
}

export async function removeAssignment(id) {
  try {
    const ok = await deleteInboxMessageRemote(id);
    if (ok) return true;
  } catch {
    /* local */
  }
  saveLocalMessages(localMessages().filter((row) => String(row.id) !== String(id)));
  return true;
}
