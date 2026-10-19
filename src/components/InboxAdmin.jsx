import { useEffect, useState } from "react";
import { CLASS_IDS, isPartTimeClass } from "../data/classes";
import { loadSession } from "../state/auth";
import {
  formatInboxWhen,
  loadAssignmentsAdmin,
  postAssignment,
  removeAssignment,
} from "../state/inbox";

export default function InboxAdmin() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const list = await loadAssignmentsAdmin();
    setRows(list);
  }

  useEffect(() => {
    reload();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const result = await postAssignment({
      title,
      body,
      classId,
      createdBy: loadSession()?.username || "",
    });
    setBusy(false);
    if (!result.ok) {
      setStatus(result.error || "Could not post.");
      return;
    }
    setTitle("");
    setBody("");
    setClassId("");
    setStatus(
      result.local
        ? "Saved on this device. Run inbox.sql in Supabase so every student can see it."
        : "Posted to the inbox."
    );
    await reload();
  }

  async function remove(id) {
    await removeAssignment(id);
    await reload();
  }

  return (
    <section className="admin-walk-feedback">
      <h2>Inbox assignments</h2>
      <p className="login-hint">
        Posts show under the bell at the top left. Pick a class or send to
        everyone. When you mark a question report resolved, that student also
        gets an automated inbox message.
      </p>
      <form className="admin-add inbox-admin-form" onSubmit={submit}>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 8 tutorial"
            maxLength={80}
            required
          />
        </label>
        <label>
          Class
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Every class</option>
            {CLASS_IDS.map((id) => (
              <option key={id} value={id}>
                {isPartTimeClass(id) ? "EEPT (part-time)" : id}
              </option>
            ))}
          </select>
        </label>
        <label className="inbox-admin-body">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="What should they do?"
          />
        </label>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Posting…" : "Post to inbox"}
        </button>
        {status ? <p className="login-hint">{status}</p> : null}
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Title</th>
              <th>Class</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatInboxWhen(row.createdAt)}</td>
                  <td>
                    <strong>{row.title}</strong>
                    {row.body ? (
                      <>
                        <br />
                        <span className="login-hint">{row.body}</span>
                      </>
                    ) : null}
                  </td>
                  <td>{row.classId || "All"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-name-btn"
                      onClick={() => remove(row.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No assignments posted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
