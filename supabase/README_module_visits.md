# Module visit tracking → `module_times_logged.csv`

Records **which module a user opened and how long they stayed** — a per-module
breakdown that complements the whole-site `session_times` tracking.

> As with session times, the data lives in a Postgres **table**
> (`public.module_visits`); `module_times_logged.csv` is produced *from* it via
> the SQL Editor or the in-app admin export.

## 1. One-time setup

1. Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of [`module_visits.sql`](./module_visits.sql) and **Run**.
3. Confirm it created:
   - table `public.module_visits`
   - functions `log_module_visit`, `list_module_visits`
   - views `public.module_times_logged`, `public.module_times_totals`
   - GMT+8 views `public.module_times_logged_sgt`, `public.module_times_totals_sgt`

The table only accepts writes for accounts in `authorised_users`, via the
`SECURITY DEFINER` RPCs (the anon key can't touch it directly).

## 2. How visits are captured (automatic)

`useModuleTime()` (wired in `App.jsx`) starts a **visit** each time the current
learning module changes, and ends it when the user leaves that module (finishes,
exits, navigates away, or closes the tab) — i.e. from the first click into the
module to the last click on the way out.

Only **learning modules** are tracked (see `MODULE_SCREENS` in `App.jsx`):
lessons, the drag-circuit labs, source-transformation / op-amp / Laplace labs,
section walks, past papers, and skip quizzes. Navigation/menu screens (`home`,
leaderboards, `profile`, `guide`, `updates`, `results`) are deliberately **not**
tracked.

Each visit is identified by its `screen` (the `module_key`) plus a finer
`module_detail`:

- normal lesson → `"<topicId>-<difficulty>"` (e.g. `2-1`)
- question-bank lesson → `"bank-<bankId>-<difficulty>"`
- section walk → the walk key; Laplace lab → the lab id; past paper → paper id

Each visit:
- counts **active** time (pauses while the tab is hidden),
- **heartbeats** every 30s,
- flushes a final value via **`sendBeacon`** when you leave the module or close
  the tab.

Admins/staff are excluded so their browsing doesn't skew the data.

## 3. Reading / exporting

### Option A — Supabase SQL Editor

```sql
-- Per visit (sorted by user, module, entry time)
select * from public.module_times_logged;        -- UTC
select * from public.module_times_logged_sgt;     -- GMT+8

-- Per user + module totals ("how long did X spend in each module?")
select * from public.module_times_totals;         -- UTC
select * from public.module_times_totals_sgt;      -- GMT+8
```

Then click **Download CSV** and save as `module_times_logged.csv`.

Useful ad-hoc queries:

```sql
-- Total time a specific student spent per module
select module_key, module_label, total_minutes
from public.module_times_totals
where email = 'someone@e.ntu.edu.sg';

-- Most time-consuming modules across everyone
select module_key, round(sum(total_seconds)/3600.0, 2) as hours
from public.module_times_totals
group by module_key
order by hours desc;
```

### Option B — In-app admin export

```js
import { downloadModuleTimesLoggedCsv } from "./state/moduleTimesExport";

await downloadModuleTimesLoggedCsv(); // downloads module_times_logged.csv
```

CSV columns:

```
email, class_id, module_key, module_detail, module_label, visit_id,
session_id, entered_at, last_seen_at, duration_seconds, duration_minutes,
duration_hms, duration_hours
```

## Files

| File | Purpose |
|------|---------|
| `supabase/module_visits.sql` | Table, RPCs, UTC + GMT+8 reporting views |
| `src/supabaseClient.js` | `logModuleVisit`, `logModuleVisitBeacon`, `listModuleVisits` |
| `src/state/moduleTimer.js` | Active-time timer per module (heartbeat + unload flush) |
| `src/hooks/useModuleTime.js` | React hook driving the timer per current module |
| `src/state/moduleTimesExport.js` | Builds/downloads `module_times_logged.csv` |
