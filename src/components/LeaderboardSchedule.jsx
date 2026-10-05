import { useEffect, useState } from "react";
import {
  getLeaderboardConfigRemote,
  setLeaderboardConfigRemote,
} from "../supabaseClient";
import { refreshLeaderboardPeriod, nextResetAt } from "../state/leaderboardPeriod";

// ISO day of week: 1 = Monday ... 7 = Sunday.
const DOW_OPTIONS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

function formatReset(ms) {
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(ms).toISOString();
  }
}

// Admin-only panel to configure when the weekly leaderboard resets.
export default function LeaderboardSchedule() {
  const [dow, setDow] = useState(2); // Tuesday
  const [time, setTime] = useState("00:00");
  const [recur, setRecur] = useState(1); // weekly
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [resetAt, setResetAt] = useState(nextResetAt());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getLeaderboardConfigRemote();
        if (!cancelled && cfg) {
          setDow(Number(cfg.anchorDow) || 2);
          setTime(String(cfg.anchorTime || "00:00").slice(0, 5));
          setRecur(Number(cfg.recurWeeks) || 1);
        }
        await refreshLeaderboardPeriod();
        if (!cancelled) setResetAt(nextResetAt());
      } catch {
        if (!cancelled) setStatus("Couldn't load the current schedule.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await setLeaderboardConfigRemote(dow, time, recur);
      await refreshLeaderboardPeriod();
      setResetAt(nextResetAt());
      setStatus("Saved. Schedule updated.");
    } catch (err) {
      setStatus(err?.message || "Couldn't save the schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-walk-feedback leaderboard-schedule">
      <h2>Leaderboard reset schedule</h2>
      <p className="login-hint">
        Controls when the <strong>weekly</strong> leaderboard rankings reset.
        XP is never wiped — a snapshot is taken and ranking shows XP earned since
        then. (This is separate from the trophy-league season.)
      </p>

      {loading ? (
        <p className="login-hint">Loading…</p>
      ) : (
        <form className="admin-add" onSubmit={handleSave}>
          <label>
            Reset day
            <select value={dow} onChange={(e) => setDow(Number(e.target.value))}>
              {DOW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time (SGT)
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label>
            Repeat
            <select
              value={recur}
              onChange={(e) => setRecur(Number(e.target.value))}
            >
              <option value={1}>Weekly</option>
              <option value={2}>Every 2 weeks</option>
            </select>
          </label>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? "Saving…" : "Save schedule"}
          </button>
          {status ? <p className="login-hint">{status}</p> : null}
        </form>
      )}

      <p className="login-hint">
        Next reset: <strong>{formatReset(resetAt)}</strong> (SGT)
      </p>
    </section>
  );
}
