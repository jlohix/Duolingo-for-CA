import { useEffect, useState } from "react";
import {
  listLeaderboardHistoryRemote,
  getLeaderboardHistoryRemote,
} from "../supabaseClient";

// Label a past period, e.g. "Week 2" (weekly) or "Period 2" (bi-weekly), with
// its SGT date range.
function periodTitle(row) {
  const unit = Number(row.recur_weeks) >= 2 ? "Period" : "Week";
  const start = row.period_start_sgt
    ? new Date(row.period_start_sgt).toLocaleDateString("en-SG", {
        timeZone: "Asia/Singapore",
        day: "numeric",
        month: "short",
      })
    : "";
  const end = row.period_end_sgt
    ? new Date(row.period_end_sgt).toLocaleDateString("en-SG", {
        timeZone: "Asia/Singapore",
        day: "numeric",
        month: "short",
      })
    : "";
  const range = start && end ? ` · ${start}–${end}` : "";
  return `${unit} ${row.period_index}${range}`;
}

// A click-in, scrollable list of previous leaderboard periods. Selecting one
// loads and shows that period's frozen standings. Visible to students + admins.
// `classId` (optional) scopes the standings to a class.
export default function LeaderboardHistory({ classId = null, youName = "" }) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listLeaderboardHistoryRemote();
        if (!cancelled) setPeriods(list);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Couldn't load past weeks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openPeriod(id) {
    setSelectedId(id);
    setRowsLoading(true);
    setRows([]);
    try {
      const data = await getLeaderboardHistoryRemote(id, classId);
      setRows(data);
    } catch (err) {
      setError(err?.message || "Couldn't load that week.");
    } finally {
      setRowsLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="board-history">
        <h2>Previous weeks</h2>
        <p className="login-hint">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="board-history">
        <h2>Previous weeks</h2>
        <p className="chat-error">{error}</p>
      </section>
    );
  }

  if (periods.length === 0) {
    return (
      <section className="board-history">
        <h2>Previous weeks</h2>
        <p className="login-hint">
          No past weeks yet. Once a week ends, its leaderboard is saved here.
        </p>
      </section>
    );
  }

  const selected = periods.find((p) => p.id === selectedId) || null;

  return (
    <section className="board-history">
      <h2>Previous weeks</h2>
      <p className="login-hint">
        Tap a past week to see how the leaderboard looked then.
      </p>

      <div className="board-history-list">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`board-history-item ${p.id === selectedId ? "on" : ""}`}
            onClick={() => openPeriod(p.id)}
          >
            {periodTitle(p)}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="board-history-detail">
          <h3>{periodTitle(selected)}</h3>
          {rowsLoading ? (
            <p className="login-hint">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="login-hint">No entries for this week.</p>
          ) : (
            <ol className="board">
              {rows.map((row) => {
                const isYou =
                  youName &&
                  String(row.email).toLowerCase() === youName.toLowerCase();
                return (
                  <li
                    key={row.email}
                    className={`board-row ${isYou ? "you" : ""}`}
                  >
                    <span className="board-rank">{row.rank}</span>
                    <span className="board-name">
                      {row.email}
                      {isYou ? " (you)" : ""}
                      <span className="class-chip">{row.class_id}</span>
                    </span>
                    <span className="board-xp">{row.xp_earned} XP</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : null}
    </section>
  );
}
