import { useCallback, useEffect, useState } from "react";
import {
  formatInboxWhen,
  loadInbox,
  markInboxAllRead,
  markInboxRead,
} from "../state/inbox";
import { linkify } from "../data/linkify.jsx";

export default function InboxBell({ email, classId }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!email) {
      setItems([]);
      return;
    }
    const rows = await loadInbox(email, classId);
    setItems(rows);
  }, [email, classId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 45000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!email) return null;

  const unread = items.filter((row) => !row.read).length;

  async function openInbox() {
    setOpen(true);
    await refresh();
  }

  async function readOne(id) {
    await markInboxRead(email, id);
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, read: true } : row))
    );
  }

  async function readAll() {
    await markInboxAllRead(email, classId);
    setItems((prev) => prev.map((row) => ({ ...row, read: true })));
  }

  return (
    <>
      <button
        type="button"
        className="inbox-bell-btn"
        aria-label={
          unread ? `Inbox, ${unread} unread` : "Inbox"
        }
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openInbox())}
      >
        <i className="fa fa-bell" aria-hidden="true" />
        {unread ? (
          <span className="inbox-badge">{unread > 9 ? "9+" : unread}</span>
        ) : null}
      </button>
      {open ? (
        <div
          className="overlay inbox-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="event-sheet inbox-sheet"
            role="dialog"
            aria-labelledby="inbox-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inbox-head">
              <div>
                <p className="eyebrow" id="inbox-heading">
                  Inbox
                </p>
                <h2>Notifications</h2>
              </div>
              {unread ? (
                <button type="button" className="ghost" onClick={readAll}>
                  Mark all read
                </button>
              ) : null}
            </div>
            {items.length === 0 ? (
              <p className="login-hint">No messages yet.</p>
            ) : (
              <ul className="inbox-list">
                {items.map((row) => (
                  <li key={row.id}>
                    {/* role=button (not <button>) so URL links in the body are
                        valid nested interactive content. Links stop propagation
                        so clicking one doesn't also mark-read. */}
                    <div
                      role="button"
                      tabIndex={0}
                      className={`inbox-item ${row.read ? "" : "unread"}`}
                      onClick={() => readOne(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          readOne(row.id);
                        }
                      }}
                    >
                      <span className="inbox-item-kind">
                        {row.kind === "report_resolved"
                          ? "Report"
                          : "Assignment"}
                      </span>
                      <strong>{row.title}</strong>
                      {row.body ? <span>{linkify(row.body)}</span> : null}
                      <span className="inbox-item-when">
                        {formatInboxWhen(row.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="ghost sheet-cancel"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
