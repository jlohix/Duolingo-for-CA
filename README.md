# 🦉 Circuito — Duolingo for Circuit Analysis

A gamified, bite-sized web app that helps Electrical & Electronic Engineering
students master **circuit analysis** — Ohm's & Kirchhoff's laws, Thevenin/Norton
equivalents, op-amps, transients, and Laplace-domain analysis — through short,
interactive lessons with XP, streaks, and competitive leagues.

> **Branch note:** This is the `faizah` branch, which contains the full
> **React (Vite)** application. Other branches contain earlier tooling (e.g. the
> standalone Question Bank Manager) and assets.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Accounts](#-accounts)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Where to Start Reading](#-where-to-start-reading-the-code)
- [How It Works](#-how-it-works)
- [The Question System](#-the-question-system)
- [Adding Content](#-adding-content)
- [Known Limitations](#-known-limitations)

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [React 19](https://react.dev/) |
| **Build tool / dev server** | [Vite 6](https://vite.dev/) |
| **Math rendering** | [KaTeX](https://katex.org/) |
| **CSV parsing** | [PapaParse](https://www.papaparse.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Backend** | [Supabase](https://supabase.com/) (auth, consent, class boards, session/module logs, leaderboard history, chatbot) |
| **Local state** | React state + `localStorage` (XP, streaks, lesson completion, theme) |
| **Styling** | Plain CSS (`src/index.css`) with a light/dark theme |

Student login, class membership, and staff analytics go through Supabase RPCs in
`src/supabaseClient.js`. Lesson progress and XP still live in `localStorage` and
are synced for students.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` if you need to
point at another project. The app has defaults for the Circuito project.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- npm (bundled with Node.js)

### Installation & running

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
#    http://127.0.0.1:5173  (or http://localhost:5173)
```

> **Do not open `index.html` directly** by double-clicking it. The app is a
> Vite project and must be served by the dev server — opening it as a `file://`
> URL will show a reminder screen instead of the app.

The dev server runs on a **fixed port `5173`** (`strictPort` is enabled in
`vite.config.js`), so if that port is busy the server will fail rather than pick
another one — free the port and retry.

---

## 🔑 Accounts

| Role | How to sign in |
| --- | --- |
| **Student** | NTU email (`…@e.ntu.edu.sg`). First time: matriculation number, then choose a password. After that, log in with that password and pick a class (EE01–EE22, or EEPT). |
| **Staff / admin** | Local preview user `admin` / `meowmeow`, or an NTU staff email listed in `src/state/auth.js`. |

- **Student** — lessons, XP, streaks, class/cohort boards, trophy leagues. Consent is recorded before play.
- **Staff** — can open any lesson as a **preview** (no XP, no student progress). Admin screens cover class/cohort/individual boards, roster, module attempts, and session times.

Staff emails are the Circuito teaching team, not a public signup list.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173. |
| `npm run build` | Build the production bundle into `dist/`. |
| `npm run preview` | Serve the production build locally to test it. |

---

## 📂 Project Structure

```
Duolingo-for-CA/  (faizah branch)
├── index.html                # Vite HTML entry point
├── vite.config.js            # Vite config (React plugin, port 5173)
├── package.json              # Dependencies & scripts
├── supabase/                 # SQL helpers (session times, module visits, leaderboard history)
│
├── public/                   # Static assets served as-is at runtime
│   ├── QuestionBank.csv       #   Extra / legacy questions (fetched on load)
│   ├── PastYearPapers.csv     #   Past-year exam questions
│   ├── question-bank/         #   Per-topic CSVs + images (GitHub URLs or local files)
│   └── mascots/               #   "Sunwoo" owl mascot frames
│
└── src/
    ├── main.jsx              # App bootstrap (React root, ThemeProvider, ErrorBoundary)
    ├── App.jsx               # Root component + screen router
    ├── index.css             # Global styles / design system
    ├── walks.js              # Registry of "section walk" lesson components
    ├── supabaseClient.js     # Supabase RPC helpers (login, boards, logs, chatbot)
    │
    ├── state/                # Session, progress, leagues, analytics
    │   ├── auth.js            #   Student login (NTU email) + local admin
    │   ├── progress.js        #   XP, streaks, completed lessons (all topics unlocked)
    │   ├── progressSync.js    #   Push/pull student progress to Supabase
    │   ├── roster.js          #   Classmates for boards
    │   ├── league.js          #   Trophy-league seasons
    │   ├── changelog.js       #   Which Updates items were seen (+ custom logs)
    │   └── theme.jsx          #   Light/dark theme context
    │
    ├── data/                 # Content + content loading
    │   ├── loadQuestions.js   #   Fetches & parses question CSVs; answer checking
    │   ├── questionBanks.js   #   Registry of CSV-backed question banks
    │   ├── topics.js          #   8 Learn sections (7–8 are coming soon)
    │   ├── changelog.js       #   Built-in Updates copy (student-facing)
    │   ├── dragCircuits.js    #   Hardcoded drag-lab question sets
    │   ├── *Lab.js            #   Step-by-step walkthrough scripts per topic
    │   └── ...                #   Hints, primers, classes, trophies
    │
    ├── hooks/
    │   └── useQuizQueue.js    # Quiz engine: queue, scoring, review-missed logic
    │
    ├── components/           # Presentational UI
    │   ├── AppShell.jsx        #   App layout + navigation
    │   ├── QuestionCard.jsx    #   One MCQ (family stem + image + part)
    │   ├── MathText.jsx        #   LaTeX via KaTeX
    │   ├── ChatWidget.jsx      #   Optional tutor chatbot
    │   └── ...                 #   Schematics, streak/league chrome, reports
    │
    ├── pages/                # Top-level screens
    │   ├── Home.jsx            #   Learn path (sections, banks, past papers)
    │   ├── Login.jsx           #   Login / first password
    │   ├── Lesson.jsx          #   Runs a quiz for a bank/difficulty
    │   ├── Results.jsx         #   Post-lesson summary
    │   ├── Leaderboard.jsx     #   Class / cohort / individual (+ past weeks)
    │   ├── Leagues.jsx         #   Trophy league standings
    │   ├── Profile.jsx         #   Board name, insights (walks hidden for students)
    │   ├── Guide.jsx           #   How to use Circuito
    │   ├── Admin.jsx           #   Staff dashboards
    │   └── ...                 #   Skip quiz, guided lessons, updates
    │
    └── section2/ … section6/ # Self-contained walkthrough modules
        └── section5/          #   Laplace transforms (largest module)
```

---

## 🧭 Where to Start Reading the Code

New to the codebase? Read in this order:

1. **`src/App.jsx`** — top-level state and which screen to render.
2. **`src/state/progress.js`** — XP, streaks, and (currently open) unlocks.
3. **`src/data/loadQuestions.js`** — how questions are loaded and answers checked.
4. **`src/hooks/useQuizQueue.js`** — how a quiz runs question by question.
5. Pick one **`section*/`** folder — they follow the same shape.

**Mental model:** `state/` is logic, `data/` is content, `components/` is UI,
`pages/` are screens, and `App.jsx` wires them together.

---

## ⚙️ How It Works

### Routing (no URL router)

The app does **not** use a URL router. `App.jsx` keeps a `screen` string in state
and renders with `if (screen === "...")`. Navigation is `setScreen(...)`.

> There are no shareable/deep-linkable URLs, and the browser Back button does
> not move between screens.

### Learn path

Learn shows eight sections:

1. Basic laws  
2. Op-amps  
3. Transients  
4. First-order circuits (no practice bank — Laplace is already open)  
5. Laplace Transform  
6. Poles and Zeros  
7. Network functions — **coming soon**  
8. Frequency domain — **coming soon**  

Walkthroughs are **optional**. Every section that has lessons is already open.
Students can play **Easy, Average, and Challenging in any order**. Progress bars
still fill as they complete banks. Staff preview does not award XP.

Past year papers sit at the bottom of Learn.

### Progression (XP, streaks)

- First-try correct answers: **10 / 20 / 30 XP** (Easy / Average / Challenging).
- Finishing a lesson: **20 / 40 / 60 XP**. Walkthroughs use Easy rates.
- Replaying a finished lesson is practice only (no extra XP).
- Practice at least once a calendar day to keep the **streak**.
- Student progress is stored in `localStorage` (keyed by email) and synced
  through Supabase. Clearing the browser can still drop unsynced local state.

### Leagues and boards

- **Trophy leagues** (`state/league.js`): everyone starts in Bronze. Every 3 days,
  the top 20% promote and the bottom 20% demote. XP only ranks that round.
- **Class board** ranks students in the same class by total XP.
- **Cohort board** ranks those classes.
- **Individual** shows the top 10 in the cohort, plus your place.
- Leaderboards keep a **previous-weeks** history.

---

## 📚 The Question System

Questions come from two places:

1. **CSV files** in `public/` (`QuestionBank.csv`, `PastYearPapers.csv`, and the
   per-bank CSVs under `public/question-bank/csv/`). Fetched at runtime and
   parsed by `loadQuestions.js`. Prefer **GitHub image URLs** in the CSV when
   the figure lives on the main asset repo; local files under
   `public/question-bank/` are used when a figure was edited on this branch
   (for example Poles `polesq2v2.png`).
2. **Hardcoded JavaScript** in `src/data/` — drag-lab sets (`dragCircuits.js`)
   and walkthrough scripts (`*Lab.js`).

Each MCQ has a question, four options (A–D), a correct answer, an optional image,
an explanation (LaTeX-supported), and a difficulty (1–3). Multi-part families
share a stem and figure across steps (`id` like `203-3`).

> **Answers are checked on the client** (`isAnswerCorrect` in
> `loadQuestions.js`). The answer key ships to the browser.

Student-facing Updates copy lives in `src/data/changelog.js` (`BUILT_IN_LOGS`).
Do not write those entries to `localStorage`.

---

## ✏️ Adding Content

- **Add MCQs:** edit the relevant CSV in `public/question-bank/csv/` (columns:
  `id`, `topicId`, `main_question`, `question`, `optionA`–`optionD`, `answer`,
  `image`, `explanation`, `difficulty`, `walkthrough_tag`).
- **Add a question bank:** register it in `src/data/questionBanks.js` and add its
  CSV + image folder under `public/question-bank/`.
- **Add/edit a walkthrough:** edit the matching `src/data/*Lab.js` (or a
  `section*/labs*` file).
- **Add a topic:** update `src/data/topics.js` and `Home.jsx`.
- **Student-visible change:** add a new object at the **top** of `BUILT_IN_LOGS`
  in `src/data/changelog.js`.

---

## ⚠️ Known Limitations

- **Scoring is still client-side.** XP and answer-checking happen in the
  browser, so they are not tamper-proof.
- **No URL router**, so no deep links and no Back-button navigation.
- **No tests, linter, or formatter** are configured yet.
- **Network functions** and **Frequency domain** have no practice content yet
  (coming soon).
- First-order circuits has no question bank; Laplace is already open.
- Staff preview does not change student XP or progress.

Open **Updates** in the sidebar for what changed for students. Open **How to use**
for the short tour.
