# Session time tracking → `user_times_logged.csv`

This feature records **how long each user spends on the site** and lets the
team export the timings as `user_times_logged.csv`, sorted by user and by time.

> Note: Supabase is a Postgres database, so the data lives in a **table**
> (`public.session_times`), not as a file. `user_times_logged.csv` is produced
> **from** that data — either by exporting the `user_times_logged` view in the
> SQL Editor, or with the in-app admin export button.

> **Timezone (GMT+8):** timestamps are *stored* in UTC (the correct,
> non-destructive way), and the original views/RPCs are **unchanged**. For
> Singapore local time (UTC+8), use the **additional `*_sgt` views** that are
> appended to each SQL file — nothing existing is dropped or altered:
>
> | UTC (original) | GMT+8 (appended) |
> |----------------|------------------|
> | `public.user_times_logged` | `public.user_times_logged_sgt` |
> | `public.user_times_totals` | `public.user_times_totals_sgt` |
> | `public.student_consent_decrypted` | `public.student_consent_decrypted_sgt` |
> | `public.question_reports` | `public.question_reports_sgt` |
>
> These use `... at time zone 'Asia/Singapore'`, so their `*_sgt` timestamp
> columns read as Singapore local time. Export the SGT CSV from
> `select * from public.user_times_logged_sgt;`. Machine-only timestamps
> (league `seasonStart` epoch, progress `updatedAt`) stay in UTC.

## 1. One-time setup

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of [`session_times.sql`](./session_times.sql) and click **Run**.
3. Confirm it created:
   - table `public.session_times`
   - functions `log_session_time`, `list_session_times`
   - views `public.user_times_logged`, `public.user_times_totals`

The table only accepts writes for accounts that already exist in
`authorised_users` (same guard as `student_progress`), and the anon key can
only reach it through the `SECURITY DEFINER` RPCs — never directly.

## 2. How timings are captured (automatic)

When a logged-in student uses the app, `useSessionTime()` (wired in `App.jsx`)
starts a timer that:

- counts **active** time (pauses while the browser tab is hidden),
- **heartbeats** the running duration to `log_session_time` every 30s,
- does a final **`sendBeacon`** flush when the tab is hidden or closed
  (so the last value survives the page closing).

Admins/staff are excluded so their browsing doesn't skew engagement data.

## 3. Getting `user_times_logged.csv`

### Option A — Supabase SQL Editor (recommended)

```sql
select * from public.user_times_logged;   -- already sorted by user, then start time
```

Then click **Download CSV** on the results grid and save it as
`user_times_logged.csv`.

For per-user totals instead of per-session rows:

```sql
select * from public.user_times_totals;
```

### Option B — In-app admin export

From admin code, call:

```js
import { downloadUserTimesLoggedCsv } from "./state/sessionTimesExport";

await downloadUserTimesLoggedCsv(); // downloads user_times_logged.csv
```

This fetches every session via `list_session_times`, sorts by user + time,
and downloads a CSV with these columns:

```
email, class_id, session_id, started_at, last_seen_at,
duration_seconds, duration_minutes, duration_hours, duration_hms
```

## Files

| File | Purpose |
|------|---------|
| `supabase/session_times.sql` | Table, RPCs, and reporting views |
| `src/supabaseClient.js` | `logSessionTime`, `logSessionTimeBeacon`, `listSessionTimes` |
| `src/state/sessionTimer.js` | Active-time timer with heartbeat + unload flush |
| `src/hooks/useSessionTime.js` | React hook driving the timer per logged-in user |
| `src/state/sessionTimesExport.js` | Builds/downloads `user_times_logged.csv` |
