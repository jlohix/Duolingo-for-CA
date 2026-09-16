# Per-question-family timing

Tracks how long each student spends on a whole **question family** (all the
steps of one question, e.g. `201-1`, `201-2`, … `201-n` → family `201`) and
saves one record per completed family to Supabase.

## What gets recorded

One row per completed family attempt, in `public.question_family_times`:

| field                | meaning                                                        |
| -------------------- | -------------------------------------------------------------- |
| `email` (studentId)  | the student's login id                                         |
| `session_id`         | unique id generated at login (one per login)                   |
| `question_family_id` | the family, e.g. `201`                                          |
| `class_id`           | the student's class (context)                                  |
| `login_time`         | when the student logged in (ISO)                               |
| `question_start_time`| when they **first** entered the family (not reset per step)    |
| `question_finish_time`| when they completed the **final** step of the family          |
| `duration_seconds`   | `finish - start` (recomputed server-side, clamped ≥ 0)         |

## Setup (once)

1. Supabase project → **SQL Editor → New query**.
2. Paste the entire `supabase/question_family_times.sql` and click **Run**.
3. Confirm the table `public.question_family_times` and the functions
   `log_question_family_time`, `list_question_family_times` exist.

Requires `public.authorised_users` to already exist (from
`student_progress.sql`) — writes are only accepted for known accounts.

## How it works in the app

- On login, `beginTimingSession()` captures `loginTime` + a `sessionId`.
- As the student moves through a lesson, `noteFamilyStep(familyId)` records
  the start time the **first** time each family is seen; moving between steps
  or revisiting a step does **not** reset it.
- When the family's final step is completed, `completeFamily(familyId)`
  computes the duration and calls the `log_question_family_time` RPC.
- The skip-out placement quiz is intentionally excluded (it isn't a
  question-family workflow).

No admin/staff activity is tracked.

## Reading / exporting the data (staff, SQL Editor)

```sql
select * from public.question_family_times_logged;  -- sorted by user, then start time
```

Then use the SQL Editor's **Download CSV** button on the results.

Example row: a student who starts `201-1` at 16:55:10 and finishes the final
`201-n` step at 16:58:35 produces **one** record for family `201` with
`duration_seconds = 205`.
