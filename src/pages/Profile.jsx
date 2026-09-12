import { visibleStreak, topicInsight, chooseDisplayName, DISPLAY_NAME_MAX, setAvatarUrl } from "../state/progress";
import { DEFAULT_CLASS, normalizeClassId } from "../data/classes";
import { avatarSrc } from "../data/avatars";
import { displayNameFor } from "../state/roster";
import { isAdmin } from "../state/auth";
import { flushProgressPush } from "../state/progressSync";
import { uploadAvatar } from "../supabaseClient";
import TopicInsight from "../components/TopicInsight";
import HexStats from "../components/HexStats";
import StreakNotice from "../components/StreakNotice";
import { useState } from "react";

// Resize/compress an image file to a small square PNG blob for the avatar.
function compressAvatar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        // Center-crop to a square, then draw scaled into the canvas.
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compress failed"))),
          "image/png",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const STRENGTH_KINDS = new Set(["strength", "solid"]);
const WEAK_KINDS = new Set(["weakness", "developing"]);

export default function Profile({ user, topics, progress, setProgress, onPractice }) {
  const streak = visibleStreak(progress);
  const staff = isAdmin(user);
  const fallbackName = displayNameFor(user.username);
  const [nameDraft, setNameDraft] = useState(
    progress.displayName || fallbackName
  );
  const [nameStatus, setNameStatus] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState("");
  const boardName = progress.displayName || fallbackName;

  async function handleAvatarPick(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarStatus("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarStatus("Image must be under 10MB.");
      return;
    }
    setAvatarBusy(true);
    setAvatarStatus("");
    try {
      const blob = await compressAvatar(file);
      const url = await uploadAvatar(user.username, blob);
      let next = progress;
      setProgress((p) => {
        next = setAvatarUrl(p, url);
        return next;
      });
      const ok = await flushProgressPush(user, next);
      setAvatarStatus(
        ok
          ? "Picture updated."
          : "Picture uploaded, but cloud sync is unavailable right now."
      );
    } catch (err) {
      setAvatarStatus(err.message || "Could not update picture.");
    } finally {
      setAvatarBusy(false);
    }
  }
  const rows = topics.map((topic) => ({
    topic,
    insight: topicInsight(progress, topic.id),
  }));
  const measured = rows.filter((row) => row.insight.attempts > 0);
  const strengths = rows
    .filter((row) => STRENGTH_KINDS.has(row.insight.kind))
    .sort((a, b) => b.insight.pct - a.insight.pct);
  const weaknesses = rows
    .filter((row) => WEAK_KINDS.has(row.insight.kind))
    .sort((a, b) => a.insight.pct - b.insight.pct);
  const starting = rows.filter((row) => row.insight.kind === "starting");
  const empty = rows.filter((row) => row.insight.kind === "empty");

  async function saveName(event) {
    event.preventDefault();
    setNameBusy(true);
    setNameStatus("");
    let next = progress;
    setProgress((p) => {
      next = chooseDisplayName(p, nameDraft);
      return next;
    });
    setNameDraft(next.displayName || fallbackName);
    if (staff) {
      setNameStatus("Saved on this device.");
      setNameBusy(false);
      return;
    }
    const ok = await flushProgressPush(user, next);
    setNameStatus(
      ok
        ? "Saved to your account. It will show on other devices when you log in."
        : "Saved on this device. Cloud sync is unavailable right now."
    );
    setNameBusy(false);
  }

  return (
    <div className="page">
      <header className="topbar profile-topbar">
        <div className="profile-identity">
          {!staff ? (
            <div className="profile-avatar-wrap">
              <img
                className="profile-avatar"
                src={avatarSrc(progress.avatarUrl)}
                alt="Your profile picture"
                width={72}
                height={72}
              />
              <label className="profile-avatar-edit">
                {avatarBusy ? "Uploading…" : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarPick}
                  disabled={avatarBusy}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          ) : null}
          <div>
            <p className="eyebrow">{staff ? "Staff" : "Student"}</p>
            <h1>{boardName}</h1>
            <p className="login-hint">{user.username}</p>
            {!staff && avatarStatus ? (
              <p className="login-hint">{avatarStatus}</p>
            ) : null}
          </div>
        </div>
      </header>
      <form className="class-picker name-picker" onSubmit={saveName}>
        <label>
          Board name
          <input
            value={nameDraft}
            maxLength={DISPLAY_NAME_MAX}
            autoComplete="nickname"
            aria-describedby="name-disclaimer"
            disabled={nameBusy}
            onChange={(e) => {
              setNameDraft(e.target.value);
              setNameStatus("");
            }}
          />
        </label>
        <button type="submit" className="primary" disabled={nameBusy}>
          {nameBusy ? "Saving…" : "Save name"}
        </button>
        <p id="name-disclaimer" className="login-hint">
          This is the name on Class board and Individual. Offensive names are
          not anonymous — we know who you are :D
        </p>
        {nameStatus ? <p className="login-hint">{nameStatus}</p> : null}
      </form>
      {staff ? (
        <p className="class-picker">
          Class
          <strong>None</strong>
          <span className="login-hint">
            Staff accounts are not placed in a class.
          </span>
        </p>
      ) : (
      <p className="class-picker">
        Your class
        <strong>{normalizeClassId(progress.classId || DEFAULT_CLASS)}</strong>
        <span className="login-hint">
          Your class is set by staff. Contact your tutor if it looks wrong.
        </span>
      </p>
      )}
      <ul className="stats">
        <li>
          <strong>{progress.xp}</strong>
          <span>XP</span>
        </li>
        <li>
          <strong>{streak}</strong>
          <span>day streak</span>
        </li>
        <li>
          <strong>{measured.length}/{topics.length}</strong>
          <span>topics measured</span>
        </li>
      </ul>
      <StreakNotice
        variant="profile"
        progress={progress}
        onPractice={onPractice}
      />
      <p className="focus-line">
        Strengths and weaknesses use first-try accuracy on lessons and
        walkthroughs. A topic needs at least 3 answers before it is labeled.
      </p>

      <section className="profile-card hex-stats-card">
        <h2>Topic hex</h2>
        <HexStats topics={topics} progress={progress} />
      </section>

      <div className="profile-split">
        <section className="profile-card strengths-card">
          <h2>Strengths</h2>
          {strengths.length ? (
            <TopicList rows={strengths} />
          ) : (
            <p className="login-hint">
              No strengths yet. Hit 80% first try on a topic (60%+ counts as
              solid).
            </p>
          )}
        </section>
        <section className="profile-card weaknesses-card">
          <h2>Weaknesses</h2>
          {weaknesses.length ? (
            <TopicList rows={weaknesses} />
          ) : (
            <p className="login-hint">
              No weaknesses tagged yet. Topics under 60% first try will show
              here.
            </p>
          )}
        </section>
      </div>

      {starting.length ? (
        <section className="profile-block">
          <h2>Getting started</h2>
          <TopicList rows={starting} />
        </section>
      ) : null}

      {empty.length ? (
        <section className="profile-block">
          <h2>Not measured yet</h2>
          <TopicList rows={empty} />
        </section>
      ) : null}
    </div>
  );
}

function TopicList({ rows }) {
  return (
    <ol className="profile-topics">
      {rows.map(({ topic, insight }) => (
        <li key={topic.id} className="profile-topic">
          <div className="profile-topic-head">
            <strong>{topic.name}</strong>
            <span className="login-hint">{topic.blurb}</span>
          </div>
          <TopicInsight insight={insight} />
          {insight.attempts ? (
            <div className="insight-meter" aria-hidden="true">
              <div
                className={`insight-fill ${insight.kind}`}
                style={{ width: `${insight.pct}%` }}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
