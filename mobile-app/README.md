# 🦉 Duolingo for CA — Mobile App

A gamified, mobile-first **PWA** for the [Duolingo for CA](../README.md) Circuit Analysis
project. It turns the repo's question banks into bite-sized, Duolingo-style lessons.

Built with **React + TypeScript + Vite + Tailwind CSS**, with **KaTeX** for LaTeX math
and full **offline PWA** support. Uses the real **Sunwoo mascot** artwork from `../mascots/`.

## ✨ Features

- **Lessons** — multiple-choice questions rendered with LaTeX math and the repo's circuit figures
- **Instant feedback** — step-by-step explanations after each answer
- **Gamification** — ❤️ hearts (timed refill), 🔥 daily streaks, ⭐ XP, 💎 gems
- **🏆 10 Trophy Leagues** — Bronze → Silver → Gold → Sapphire → Ruby → Emerald → Amethyst → Pearl → Obsidian → Diamond
- **Tutorial Class Leaderboards** — EE01 – EE22
- **Resistor 4-Band Decoder** — interactive color-code calculator
- **Installable PWA** — offline caching (incl. question images), add-to-home-screen on iOS & Android

## 📚 Question bank (from this repo)

Questions are generated directly from the repo's CSV question banks:

| Source | Topic | Count |
|--------|-------|-------|
| `PYP qns CA(Sheet1) (3).csv` | Op-Amps (`topicid 1`) | 11 |
| `question-bank/Transient/transient.csv` | Transients (`topicid 2`) | 35 |
| hand-authored supplement | Network Theorems & Nodal/Mesh | 11 |

Circuit figures are loaded from the repo's `question-bank/` and `PYP-qn-images/`
folders via GitHub raw URLs (and cached offline after first view).

### Regenerating questions

If you edit the CSVs, regenerate the app's data layer:

```bash
node scripts/build-questions.mjs
```

This parses the CSVs into `src/data/questions.generated.ts` and fixes the known
broken `.../main/Transient/...` image paths to `.../main/question-bank/Transient/...`.

## 🚀 Getting started

```bash
cd mobile-app
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## 🎨 Mascot

The Sunwoo artwork in `public/mascot/` is copied from the repo's `../mascots/` folder
(happy Sunwoo → celebrate, scary Sunwoo → bat). Static poses are PNG; the celebration
and bat-swing animations are WebP, cached at runtime.

## 🛠 Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · KaTeX · Zustand · React Router · vite-plugin-pwa
