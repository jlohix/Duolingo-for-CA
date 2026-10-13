import { useEffect, useRef, useState } from "react";
import {
  listAnnouncementsRemote,
  createAnnouncementRemote,
  updateAnnouncementRemote,
  terminateAnnouncementRemote,
  deleteAnnouncementRemote,
  uploadAnnouncementImage,
} from "../supabaseClient";
import { loadSession } from "../state/auth";

const EMPTY_FORM = {
  id: null,
  title: "",
  description: "",
  imageUrl: "",
  startNow: true,
  startsAt: "",
  openEnded: true,
  endsAt: "",
  frequency: "once",
};

// Format a UTC timestamp as an SGT date-time string for display.
function fmtSgt(ts) {
  if (!ts) return "—";
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

// Convert a UTC ISO timestamp into the value a datetime-local input expects,
// expressed in SGT wall-clock (so editing round-trips correctly).
function toLocalInput(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    // Shift to SGT (UTC+8) then format as YYYY-MM-DDTHH:MM.
    const sgt = new Date(d.getTime() + 8 * 3600000);
    return sgt.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function statusOf(row) {
  if (row.is_live) return { label: "Active", cls: "live" };
  if (!row.active) return { label: "Ended", cls: "ended" };
  // active but not live => before start or after end
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now)
    return { label: "Scheduled", cls: "scheduled" };
  return { label: "Ended", cls: "ended" };
}

export default function AnnouncementsAdmin() {
  const adminEmail = loadSession()?.username || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef(null);

  async function reload() {
    setLoading(true);
    try {
      const list = await listAnnouncementsRemote();
      setRows(list);
    } catch (err) {
      setStatus(err?.message || "Couldn't load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(row) {
    setForm({
      id: row.id,
      title: row.title || "",
      description: row.description || "",
      imageUrl: row.image_url || "",
      startNow: false,
      startsAt: toLocalInput(row.starts_at),
      openEnded: !row.ends_at,
      endsAt: toLocalInput(row.ends_at),
      frequency: row.frequency === "recurring" ? "recurring" : "once",
    });
    setStatus("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus("");
    try {
      const url = await uploadAnnouncementImage(file);
      set("imageUrl", url);
    } catch (err) {
      setStatus(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setStatus("Title is required.");
      return;
    }
    setBusy(true);
    setStatus("");
    const payload = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      startsAt: form.startNow ? "" : form.startsAt,
      endsAt: form.openEnded ? "" : form.endsAt,
      frequency: form.frequency,
    };
    try {
      if (form.id) {
        await updateAnnouncementRemote({ ...payload, id: form.id, active: true });
        setStatus("Announcement updated.");
      } else {
        await createAnnouncementRemote({ ...payload, createdBy: adminEmail });
        setStatus("Announcement created.");
      }
      resetForm();
      await reload();
    } catch (err) {
      setStatus(err?.message || "Couldn't save the announcement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTerminate(id) {
    setBusy(true);
    try {
      await terminateAnnouncementRemote(id);
      await reload();
    } catch (err) {
      setStatus(err?.message || "Couldn't terminate.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement permanently?")) return;
    setBusy(true);
    try {
      await deleteAnnouncementRemote(id);
      if (form.id === id) resetForm();
      await reload();
    } catch (err) {
      setStatus(err?.message || "Couldn't delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-walk-feedback announcements-admin">
      <h2>Announcements</h2>
      <p className="login-hint">
        Students see active announcements as a pop-up when they log in. Set a
        start/end window (or start now / leave open-ended), choose once or
        recurring, and optionally add an image.
      </p>

      {/* Create / edit form */}
      <form className="admin-add announcement-form" onSubmit={handleSubmit}>
        <label className="announcement-field-wide">
          Title
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Midterm break schedule"
            maxLength={120}
          />
        </label>
        <label className="announcement-field-wide">
          Description
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What students should know…"
            rows={3}
            maxLength={2000}
          />
        </label>

        <label className="announcement-field-wide">
          Image (optional)
          <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} />
        </label>
        {uploading ? <p className="login-hint">Uploading image…</p> : null}
        {form.imageUrl ? (
          <div className="announcement-image-preview">
            <img src={form.imageUrl} alt="" />
            <button
              type="button"
              className="admin-name-btn"
              onClick={() => {
                set("imageUrl", "");
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Remove image
            </button>
          </div>
        ) : null}

        <label className="announcement-check">
          <input
            type="checkbox"
            checked={form.startNow}
            onChange={(e) => set("startNow", e.target.checked)}
          />
          Start now
        </label>
        {!form.startNow ? (
          <label>
            Start (SGT)
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </label>
        ) : null}

        <label className="announcement-check">
          <input
            type="checkbox"
            checked={form.openEnded}
            onChange={(e) => set("openEnded", e.target.checked)}
          />
          Open-ended (no end date)
        </label>
        {!form.openEnded ? (
          <label>
            End (SGT)
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
            />
          </label>
        ) : null}

        <label>
          Frequency
          <select
            value={form.frequency}
            onChange={(e) => set("frequency", e.target.value)}
          >
            <option value="once">Once (per student)</option>
            <option value="recurring">Recurring (every login)</option>
          </select>
        </label>

        <div className="announcement-form-actions">
          <button type="submit" className="primary" disabled={busy || uploading}>
            {form.id ? "Save changes" : "Create announcement"}
          </button>
          {form.id ? (
            <button
              type="button"
              className="admin-name-btn"
              onClick={resetForm}
              disabled={busy}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        {status ? <p className="login-hint">{status}</p> : null}
      </form>

      {/* Table of all announcements, active first + highlighted */}
      <div className="admin-table-wrap">
        <table className="admin-table announcements-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Title</th>
              <th>Description</th>
              <th>Shows (SGT)</th>
              <th>Frequency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-empty">Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty">No announcements yet.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const st = statusOf(row);
                return (
                  <tr key={row.id} className={row.is_live ? "announcement-live" : ""}>
                    <td>
                      <span className={`announcement-badge ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td>
                      {row.image_url ? "🖼️ " : ""}
                      {row.title}
                    </td>
                    <td className="announcement-desc-cell">{row.description || "—"}</td>
                    <td>
                      {fmtSgt(row.starts_at)}
                      {" → "}
                      {row.ends_at ? fmtSgt(row.ends_at) : "open-ended"}
                    </td>
                    <td>{row.frequency === "recurring" ? "Recurring" : "Once"}</td>
                    <td className="announcement-actions">
                      <button
                        type="button"
                        className="admin-name-btn"
                        onClick={() => startEdit(row)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      {row.is_live ? (
                        <button
                          type="button"
                          className="admin-name-btn"
                          onClick={() => handleTerminate(row.id)}
                          disabled={busy}
                        >
                          Terminate
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-name-btn danger"
                        onClick={() => handleDelete(row.id)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
