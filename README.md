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
- [Demo Accounts](#-demo-accounts)
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
| **State** | React state + `localStorage` (no backend yet) |
| **Styling** | Plain CSS (`src/index.css`) with a light/dark theme |

> ⚠️ **This is currently a client-only app.** There is no backend — accounts,
> XP, streaks, and question data all live in the browser (`localStorage` and
> bundled CSV/JS files). See [Known Limitations](#-known-limitations).

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

## 🔑 Demo Accounts

Authentication is currently **mocked** with two hardcoded accounts
(see `src/state/auth.js`):

| Role | Username | Password |
| --- | --- | --- |
| Student | `student1` | `password` |
| Admin | `admin` | `meowmeow` |

- **Student** — the normal learner experience (lessons, XP, streaks, leagues).
- **Admin** — can preview any lesson (all content unlocked) and view the admin
  dashboards (class/cohort/individual leaderboards, roster editing).

> These credentials are for local development only and will be replaced when a
> real authentication backend is added.

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
│
├── public/                   # Static assets served as-is at runtime
│   ├── QuestionBank.csv       #   Main question bank (fetched on load)
│   ├── PastYearPapers.csv     #   Past-year exam questions
│   ├── question-bank/         #   Per-topic CSVs + question images
│   └── mascots/               #   "Sunwoo" owl mascot frames
│
└── src/
    ├── main.jsx              # App bootstrap (React root, ThemeProvider, ErrorBoundary)
    ├── App.jsx               # Root component + screen router (see below)
    ├── index.css             # Global styles / design system
    ├── walks.js              # Registry of "section walk" lesson components
    │
    ├── state/                # Client-side "backend" — all localStorage
    │   ├── auth.js            #   Mock login/logout/session + isAdmin
    │   ├── progress.js        #   XP, streaks, completed lessons, topic stats
    │   ├── roster.js          #   (Mock) classmates for the leaderboard
    │   ├── league.js          #   Competitive league seasons & promotion logic
    │   ├── changelog.js        #   Tracks which "what's new" items were seen
    │   └── theme.jsx          #   Light/dark theme context
    │
    ├── data/                 # Content + content loading
    │   ├── loadQuestions.js   #   Fetches & parses question CSVs; answer checking
    │   ├── questionBanks.js   #   Registry of CSV-backed question banks
    │   ├── topics.js          #   The 7 course topics + 3 difficulty levels
    │   ├── dragCircuits.js    #   Hardcoded drag-lab question sets
    │   ├── *Lab.js            #   Step-by-step walkthrough scripts per topic
    │   ├── trophies.js        #   League tiers / trophy definitions
    │   ├── classes.js         #   Class/cohort definitions
    │   └── ...                #   Hints, primers, changelog entries, helpers
    │
    ├── hooks/
    │   └── useQuizQueue.js    # Quiz engine: queue, scoring, review-missed logic
    │
    ├── components/           # ~50 presentational components
    │   ├── AppShell.jsx        #   App layout + navigation
    │   ├── *Schematic.jsx      #   Circuit diagram renderers (Thevenin, Mesh, …)
    │   ├── QuestionCard.jsx    #   Renders a single MCQ
    │   ├── ValueDragLab.jsx    #   Draggable value/answer interaction
    │   ├── MathText.jsx        #   Renders LaTeX via KaTeX
    │   ├── QuizMascot.jsx      #   The Sunwoo owl mascot
    │   └── ...                 #   Streak/trophy/league chrome, etc.
    │
    ├── pages/                # Top-level screens
    │   ├── Home.jsx            #   Lesson map / dashboard
    │   ├── Login.jsx          #   Login screen
    │   ├── Lesson.jsx          #   Runs a quiz for a topic/difficulty
    │   ├── Results.jsx         #   Post-lesson summary
    │   ├── Leaderboard.jsx     #   Class/cohort/individual boards
    │   ├── Leagues.jsx         #   League standings
    │   ├── Profile.jsx         #   User profile & topic insights
    │   ├── Admin.jsx           #   Admin dashboard
    │   └── ...                 #   Skip quiz, guided lessons, guide, updates
    │
    └── section2/ … section5/ # Self-contained course modules (one per section)
        │                      #   Each has its own labs, schematics & drag boards
        └── section5/          #   Laplace transforms (largest module):
            ├── index.js        #     Lab registry (basics, poles, PFE, …)
            ├── LaplaceLesson.jsx
            ├── Schematics.jsx
            └── labs/           #     One file per Laplace sub-topic
```

---

## 🧭 Where to Start Reading the Code

New to the codebase? Read in this order:

1. **`src/App.jsx`** — the entry point for all app logic. It holds the top-level
   state and decides which screen to render. Start here to understand the flow.
2. **`src/state/progress.js`** — how XP, streaks, and lesson completion work.
3. **`src/data/loadQuestions.js`** — how questions are loaded and answers checked.
4. **`src/hooks/useQuizQueue.js`** — how a quiz actually runs (question by question).
5. Pick one **`section*/`** folder — they all follow the same shape, so learning
   one teaches you the rest.

**Mental model:** `state/` is logic, `data/` is content, `components/` is UI,
`pages/` are screens, and `App.jsx` wires them together.

---

## ⚙️ How It Works

### Routing (no URL router)

The app does **not** use a URL router. Instead, `App.jsx` keeps a `screen`
string in state and renders the matching screen with a series of
`if (screen === "...")` checks. Navigation happens by calling `setScreen(...)`.

> Because there is no router, the app has no shareable/deep-linkable URLs and
> the browser Back button does not navigate between screens.

### Progression (XP, streaks, unlocks)

- Answering questions correctly awards **XP** (scaled by difficulty — see
  `XP_BY_DIFFICULTY` in `progress.js`).
- Practicing on consecutive days builds a **streak**; missing a day resets it.
- Completing lessons unlocks the next difficulty/topic.
- All of this is stored in `localStorage`, so it is **per-browser** and lost if
  browser data is cleared.

### Leagues

`state/league.js` runs Duolingo-style competitive **seasons** (3 days each). Users
are ranked by XP earned during the season and promoted/demoted between league
tiers. Because there is no backend, the league is populated with **mock
classmates and synthetic rivals** rather than real users.

---

## 📚 The Question System

Questions come from two places:

1. **CSV files** in `public/` (`QuestionBank.csv`, `PastYearPapers.csv`, and the
   per-bank CSVs under `public/question-bank/csv/`). These are fetched at
   runtime and parsed by `loadQuestions.js`.
2. **Hardcoded JavaScript** in `src/data/` — the drag-lab question sets
   (`dragCircuits.js`) and the guided walkthrough scripts (`*Lab.js`).

Each MCQ has a question, four options (A–D), a correct answer, an optional image,
an explanation (LaTeX-supported), and a difficulty (1–3).

> ⚠️ **Answers are checked on the client** (`isAnswerCorrect` in
> `loadQuestions.js`), and the answer key ships to the browser. This is fine for
> a prototype but means correctness can be inspected/bypassed.

---

## ✏️ Adding Content

- **Add MCQs:** edit the relevant CSV in `public/` (columns: `id`, `topicId`,
  `question`, `optionA`–`optionD`, `answer`, `image`, `explanation`,
  `difficulty`).
- **Add a question bank:** register it in `src/data/questionBanks.js` and add its
  CSV + image folder under `public/question-bank/`.
- **Add/edit a walkthrough:** edit the matching `src/data/*Lab.js` (or a
  `section*/labs*` file).
- **Add a topic:** update `src/data/topics.js`.

---

## ⚠️ Known Limitations

This app is an early-stage prototype. Notable gaps a developer should be aware of:

- **No backend.** Auth is mocked (two hardcoded users) and all user data lives in
  `localStorage` — it is per-browser and not shared across devices.
- **Client-side scoring.** XP and answer-checking happen in the browser, so they
  are not tamper-proof.
- **Mock leaderboard/leagues.** Classmates and rivals are synthetic, not real
  users.
- **No URL router**, so no deep links and no Back-button navigation.
- **No tests, linter, or formatter** are configured yet.

> A planned migration will move accounts, XP/streaks, and questions to a
> **Supabase** backend, add server-side answer validation, and introduce a
> RAG-based AI tutor chatbot.
