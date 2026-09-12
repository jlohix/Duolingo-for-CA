import { useState } from "react";
import { DIFFICULTIES, lessonKey } from "../data/topics";
import {
  QUESTION_BANKS,
  bankLessonKey,
  questionBankForId,
} from "../data/questionBanks";
import { LAPLACE_LABS } from "../section5";
import { SECTION2_LABS } from "../section2/index.jsx";
import { SECTION3_LABS } from "../section3/index.jsx";
import { SECTION4_LABS } from "../section4/index.jsx";
import {
  isTopicUnlocked,
  isLessonUnlocked,
  SKIP_QUIZ_SIZE,
  SKIP_PASS_RATIO,
  testLessonKey,
  topicInsight,
  walkLessonKey,
} from "../state/progress";
import StreakChip from "../components/StreakChip";
import TopicInsight from "../components/TopicInsight";
import TrophyBadge from "../components/TrophyBadge";
import LabDoodles from "../components/LabDoodles";

function DoodlePage({ children }) {
  return (
    <div className="labs-fun-wrap">
      <LabDoodles />
      {children}
    </div>
  );
}

function topicMeter(topic, progress, counts, bankCounts = {}) {
  const topicKeys = DIFFICULTIES.map((d) => lessonKey(topic.id, d.id)).filter(
    (key) => (counts[key] || 0) > 0
  );
  const bankKeys = QUESTION_BANKS
    .filter((bank) => bank.topicId === topic.id)
    .flatMap((bank) =>
      DIFFICULTIES.map((difficulty) =>
        bankLessonKey(bank.id, difficulty.id)
      )
    )
    .filter((key) => (bankCounts[key] || 0) > 0);
  const keys = [...topicKeys, ...bankKeys];
  const done = keys.filter((key) => progress.completed?.includes(key)).length;
  const total = keys.length || DIFFICULTIES.length;
  return {
    done,
    total,
    pct: total ? Math.round((100 * done) / total) : 0,
  };
}

function SkipSheet({ topic, needed, onSkip, onClose }) {
  return (
    <div
      className="overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="event-sheet"
        role="dialog"
        aria-labelledby="skip-event-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">Path event</p>
        <h2 id="skip-event-title">Skip to {topic.name}</h2>
        <p>
          Pass a quick assessment of {SKIP_QUIZ_SIZE} questions from earlier
          topics. You need {needed}/{SKIP_QUIZ_SIZE} correct on the first try.
          A second miss ends the quiz — you cannot retry.
        </p>
        <button type="button" className="skip-btn" onClick={() => onSkip(topic.id)}>
          Start assessment
        </button>
        <button type="button" className="ghost sheet-cancel" onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  kicker,
  title,
  blurb,
  index,
  badge,
  unlocked,
  meter,
  current,
  skipReady,
  comingSoon = false,
  showMeter = true,
  onOpen,
  onJump,
}) {
  const cta = comingSoon
    ? "Coming soon"
    : !showMeter
    ? "Open"
    : !unlocked
      ? skipReady
        ? `Jump to section ${index}`
        : "Locked"
      : meter.pct >= 100
        ? "Review"
        : meter.pct > 0
          ? "Continue"
          : "Start";
  return (
    <article
      className={`section-card ${unlocked ? "" : "locked"} ${current ? "current" : ""}`}
    >
      <div className="section-copy">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {showMeter && unlocked ? (
          <div className="section-meter">
            <div className="meter">
              <div className="meter-fill" style={{ width: `${meter.pct}%` }} />
            </div>
            <span className="section-pct">{meter.pct}%</span>
            <span className="section-trophy" aria-hidden="true">
              🏆
            </span>
          </div>
        ) : showMeter ? (
          <p className="section-lock-meta">
            🔒{" "}
            {comingSoon
              ? "Coming soon"
              : `${meter.total} ${meter.total === 1 ? "unit" : "units"}`}
          </p>
        ) : null}
        <button
          type="button"
          className={unlocked && current ? "section-cta" : "section-cta ghost"}
          disabled={comingSoon || (!unlocked && !skipReady)}
          onClick={() => {
            if (!unlocked) {
              if (skipReady) onJump();
              return;
            }
            onOpen();
          }}
        >
          {cta}
        </button>
      </div>
      <div className="section-aside">
        <div className="section-speech">
          <p className="section-bubble">{blurb}</p>
          <img
            className="section-mascot"
            src="/mascot.png"
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}

function BankDifficultyNodes({
  bankId,
  unlocked,
  progress,
  counts,
  onStart,
  allOpen,
}) {
  const bank = questionBankForId(bankId);
  if (!bank) return null;
  return DIFFICULTIES.map((difficulty) => {
    const key = bankLessonKey(bank.id, difficulty.id);
    const count = counts[key] || 0;
    if (!count && !allOpen) return null;
    const done = progress.completed?.includes(key);
    const priorOpen = DIFFICULTIES
      .filter((item) => item.id < difficulty.id)
      .every((item) => {
        const priorKey = bankLessonKey(bank.id, item.id);
        return !counts[priorKey] || progress.completed?.includes(priorKey);
      });
    const canPlay =
      unlocked && count > 0 && (allOpen || done || priorOpen);
    return (
      <button
        key={key}
        type="button"
        className={`node ${done ? "done" : ""} ${canPlay ? "" : "off"}`}
        disabled={!canPlay}
        onClick={() => onStart(bank.id, difficulty.id)}
      >
        <span className="node-icon">{done ? "✓" : difficulty.icon}</span>
        <span className="node-name">
          {bank.title} {difficulty.name}
        </span>
        <span className="node-count">
          {!count
            ? "No questions"
            : canPlay
              ? "Step-by-step question"
              : "Locked"}
        </span>
      </button>
    );
  });
}

function LawsLabs({
  unlocked,
  labs,
  bankCounts,
  progress,
  onStartBank,
  allOpen,
}) {
  const off = unlocked ? "" : "off";
  const bankNodes = (bankId) => (
    <BankDifficultyNodes
      bankId={bankId}
      unlocked={unlocked}
      progress={progress}
      counts={bankCounts}
      onStart={onStartBank}
      allOpen={allOpen}
    />
  );
  return (
    <>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onLab}>
        <span className="node-icon">↔</span>
        <span className="node-name">R = V/I</span>
        <span className="node-count">6 Qs</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onDividerLab}>
        <span className="node-icon">÷</span>
        <span className="node-name">Dividers</span>
        <span className="node-count">V and I</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onBranchLab}>
        <span className="node-icon">÷∥</span>
        <span className="node-name">Branch dividers</span>
        <span className="node-count">10 Qs</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onPowerLab}>
        <span className="node-icon">P</span>
        <span className="node-name">Power</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onMaxPowerLab}>
        <span className="node-icon">P↑</span>
        <span className="node-name">Max power</span>
        <span className="node-count">Walkthrough</span>
      </button>
      {bankNodes("max-power")}
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onSourceTransform}>
        <span className="node-icon">V↔I</span>
        <span className="node-name">Source Transformation</span>
        <span className="node-count">Walkthrough</span>
      </button>
      {bankNodes("source-transformation")}
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onThevLab}>
        <span className="node-icon">≡</span>
        <span className="node-name">Thevenin</span>
        <span className="node-count">Walkthrough</span>
      </button>
      {bankNodes("thevenin")}
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onNortonLab}>
        <span className="node-icon">∥</span>
        <span className="node-name">Norton</span>
        <span className="node-count">Walkthrough</span>
      </button>
      {bankNodes("norton")}
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onDepLab}>
        <span className="node-icon">◇</span>
        <span className="node-name">Dependent</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onNodalLab}>
        <span className="node-icon">N</span>
        <span className="node-name">Nodal</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onMeshLab}>
        <span className="node-icon">M</span>
        <span className="node-name">Mesh</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onSuperMeshLab}>
        <span className="node-icon">SM</span>
        <span className="node-name">Supermesh</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onSuperNodeLab}>
        <span className="node-icon">SN</span>
        <span className="node-name">Supernode</span>
        <span className="node-count">Walkthrough</span>
      </button>
      <button type="button" className={`node ${off}`} disabled={!unlocked} onClick={labs.onSuperposLab}>
        <span className="node-icon">Σ</span>
        <span className="node-name">Superposition</span>
        <span className="node-count">Walkthrough</span>
      </button>
      {bankNodes("superposition")}
    </>
  );
}

function SectionWalks({
  labs,
  unlocked,
  allOpen,
  progress,
  topicId,
  onOpen,
}) {
  return (
    <>
      {labs.map((lab) => {
        const progressId = lab.progressId || lab.id;
        const key = lab.testOnly
          ? testLessonKey(topicId, progressId)
          : walkLessonKey(topicId, lab.id);
        const done = Boolean(progress?.completed?.includes(key));
        const walkDone = Boolean(
          progress?.completed?.includes(walkLessonKey(topicId, progressId))
        );
        const canOpen =
          unlocked && (!lab.testOnly || allOpen || walkDone);
        return (
          <button
            key={lab.id}
            type="button"
            className={`node ${done ? "done" : ""} ${
              canOpen ? "" : "off"
            }`}
            disabled={!canOpen}
            onClick={() => onOpen(lab.id)}
          >
            <span className="node-icon">{done ? "✓" : lab.icon}</span>
            <span className="node-name">{lab.title}</span>
            <span className="node-count">
              {lab.testOnly && !canOpen ? "Finish walkthrough first" : lab.count}
            </span>
          </button>
        );
      })}
    </>
  );
}

const SECTION_LAB_LISTS = {
  2: SECTION2_LABS,
  3: SECTION3_LABS,
  4: SECTION4_LABS,
};

function LaplaceLabs({ unlocked, onLaplaceLab }) {
  const off = unlocked ? "" : "off";
  return (
    <>
      {LAPLACE_LABS.map((lab) => (
        <button
          key={lab.id}
          type="button"
          className={`node ${off}`}
          disabled={!unlocked}
          onClick={() => onLaplaceLab(lab.id)}
        >
          <span className="node-icon">{lab.icon}</span>
          <span className="node-name">{lab.title}</span>
          <span className="node-count">{lab.count}</span>
        </button>
      ))}
    </>
  );
}

function TopicLadder({
  topic,
  index,
  unlocked,
  isSkipTarget,
  progress,
  counts,
  bankCounts,
  onStart,
  onStartBank,
  onBack,
  onAskSkip,
  onLaplaceLab,
  onSectionWalk,
  labs,
  allOpen = false,
}) {
  const firstAvailable = DIFFICULTIES.find(
    (d) => (counts[lessonKey(topic.id, d.id)] || 0) > 0
  );
  const showLawsLabs = topic.id === 1;
  const showLaplaceWalks = topic.id === 5;
  const sectionWalks = SECTION_LAB_LISTS[topic.id];
  return (
    <DoodlePage>
    <div className="page">
      <header className="topbar">
        <div>
          <button type="button" className="ghost back-link" onClick={onBack}>
            ← Back
          </button>
          <p className="eyebrow">Section {index}</p>
          <h1>{topic.name}</h1>
        </div>
      </header>
      <p className="login-hint">{topic.blurb}</p>
      {allOpen ? null : (
        <TopicInsight insight={topicInsight(progress, topic.id)} compact />
      )}
      <ol className="path ladder-path">
        <li className={`unit ${unlocked ? "" : "locked"} ${isSkipTarget ? "skip-ready" : ""}`}>
          <div className="nodes">
            {showLawsLabs ? (
              <LawsLabs
                unlocked={unlocked}
                labs={labs}
                bankCounts={bankCounts}
                progress={progress}
                onStartBank={onStartBank}
                allOpen={allOpen}
              />
            ) : null}
            {sectionWalks ? (
              <SectionWalks
                labs={sectionWalks}
                unlocked={unlocked}
                allOpen={allOpen}
                progress={progress}
                topicId={topic.id}
                onOpen={(id) => onSectionWalk(topic.id, id)}
              />
            ) : null}
            {topic.id === 2 ? (
              <BankDifficultyNodes
                bankId="opamp"
                unlocked={unlocked}
                progress={progress}
                counts={bankCounts}
                onStart={onStartBank}
                allOpen={allOpen}
              />
            ) : null}
            {showLaplaceWalks ? (
              <LaplaceLabs unlocked={unlocked} onLaplaceLab={onLaplaceLab} />
            ) : null}
            {showLaplaceWalks || sectionWalks ? (
              <p className="path-quiz-mark">
                Test your knowledge for all the walkthroughs
              </p>
            ) : null}
            {!showLawsLabs && DIFFICULTIES.map((diff) => {
              const key = lessonKey(topic.id, diff.id);
              const n = counts[key] || 0;
              const done = progress.completed?.includes(key);
              const lessonOpen =
                unlocked &&
                (allOpen ||
                  done ||
                  isLessonUnlocked(topic.id, diff.id, progress, counts));
              const canPlay = lessonOpen && n > 0;
              const skipClick =
                isSkipTarget && !unlocked && firstAvailable?.id === diff.id;
              return (
                <button
                  key={key}
                  type="button"
                  className={`node ${done ? "done" : ""} ${canPlay ? "" : "off"} ${skipClick ? "opens-skip" : ""}`}
                  disabled={!canPlay && !skipClick}
                  onClick={() => {
                    if (canPlay) onStart(topic.id, diff.id);
                    else if (skipClick) onAskSkip();
                  }}
                >
                  <span className="node-icon">{done ? "✓" : diff.icon}</span>
                  <span className="node-name">{diff.name}</span>
                  <span className="node-count">
                    {!n
                      ? "No questions"
                      : canPlay
                        ? `${n} Qs`
                        : skipClick
                          ? `${n} Qs`
                          : "Locked"}
                  </span>
                </button>
              );
            })}
          </div>
        </li>
      </ol>
    </div>
    </DoodlePage>
  );
}

export default function Home({
  topics,
  progress,
  counts,
  bankCounts = {},
  pastPapers = [],
  onStart,
  onStartBank,
  onStartPaper,
  onSkip,
  onLab,
  onThevLab,
  onNortonLab,
  onDepLab,
  onNodalLab,
  onMeshLab,
  onSuperMeshLab,
  onSuperNodeLab,
  onSuperposLab,
  onDividerLab,
  onBranchLab,
  onPowerLab,
  onMaxPowerLab,
  onSourceTransform,
  onInvOpAmp,
  onNonInvOpAmp,
  onLaplaceLab,
  onSectionWalk,
  allOpen = false,
}) {
  const [section, setSection] = useState(null);
  const [eventOpen, setEventOpen] = useState(false);
  const firstLockedIndex = allOpen
    ? -1
    : topics.findIndex(
        (_, index) => !isTopicUnlocked(index, progress, counts, bankCounts)
      );
  const skipTopic =
    firstLockedIndex >= 0 ? topics[firstLockedIndex] : null;
  const needed = Math.ceil(SKIP_QUIZ_SIZE * SKIP_PASS_RATIO);
  const currentIndex = topics.findIndex((topic, index) => {
    if (!isTopicUnlocked(index, progress, counts, bankCounts)) return false;
    return topicMeter(topic, progress, counts, bankCounts).pct < 100;
  });

  const skipSheet =
    eventOpen && skipTopic ? (
      <SkipSheet
        topic={skipTopic}
        needed={needed}
        onSkip={onSkip}
        onClose={() => setEventOpen(false)}
      />
    ) : null;

  if (section === "papers") {
    return (
      <DoodlePage>
      <div className="page">
        <header className="topbar">
          <div>
            <button
              type="button"
              className="ghost back-link"
              onClick={() => setSection(null)}
            >
              ← Back
            </button>
            <p className="eyebrow">Exam practice</p>
            <h1>Past year papers</h1>
          </div>
        </header>
        {pastPapers.length === 0 ? (
          <p className="login-hint">
            This section is ready. The question bank is not in yet — sit tight
            and it will show up here as papers you can attempt.
          </p>
        ) : (
          <>
            <p className="login-hint">
              Sit a past paper like a lesson. First finish awards XP like
              Average. Replay is practice only.
            </p>
            <ul className="paper-list">
              {pastPapers.map((pack) => {
                const done = progress.completed?.includes(pack.id);
                const n = pack.questions.length;
                return (
                  <li key={pack.id}>
                    <button
                      type="button"
                      className={`paper-row ${done ? "done" : ""}`}
                      onClick={() => onStartPaper(pack)}
                    >
                      <span className="node-icon">{done ? "✓" : "PY"}</span>
                      <span className="paper-row-copy">
                        <span className="paper-row-title">{pack.title}</span>
                        <span className="paper-row-count">
                          {n} {n === 1 ? "question" : "questions"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      </DoodlePage>
    );
  }

  if (section != null) {
    const index = topics.findIndex((t) => t.id === section);
    const topic = topics[index];
    if (topic) {
      return (
        <>
          <TopicLadder
            topic={topic}
            index={index + 1}
            unlocked={
              allOpen || isTopicUnlocked(index, progress, counts, bankCounts)
            }
            isSkipTarget={!allOpen && skipTopic && index === firstLockedIndex}
            progress={progress}
            counts={counts}
            bankCounts={bankCounts}
            onStart={onStart}
            onStartBank={onStartBank}
            onBack={() => setSection(null)}
            onAskSkip={() => setEventOpen(true)}
            onLaplaceLab={onLaplaceLab}
            onSectionWalk={onSectionWalk}
            labs={{
              onLab,
              onDividerLab,
              onBranchLab,
              onPowerLab,
              onMaxPowerLab,
              onSourceTransform,
              onThevLab,
              onNortonLab,
              onDepLab,
              onNodalLab,
              onMeshLab,
              onSuperMeshLab,
              onSuperNodeLab,
              onSuperposLab,
            }}
            allOpen={allOpen}
          />
          {skipSheet}
        </>
      );
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Your path</p>
          <h1>Learn</h1>
        </div>
        {allOpen ? null : (
        <div className="stat-row">
          <TrophyBadge index={progress.leagueIndex} compact />
          <StreakChip progress={progress} />
          <div className="xp-chip" title="Experience points">
            {progress.xp} XP
          </div>
        </div>
        )}
      </header>
      {allOpen ? (
        <p className="login-hint">
          Staff preview. Every section is open. Playing a lesson does not add
          XP or change student progress.
        </p>
      ) : null}
      <div className="section-list">
        {topics.map((topic, index) => {
          const comingSoon = topic.id >= 5;
          const unlocked =
            !comingSoon &&
            (allOpen ||
              isTopicUnlocked(index, progress, counts, bankCounts));
          const meter = topicMeter(topic, progress, counts, bankCounts);
          const skipReady =
            !comingSoon &&
            !allOpen &&
            skipTopic &&
            index === firstLockedIndex;
          return (
            <SectionCard
              key={topic.id}
              kicker={`Section ${index + 1}`}
              title={topic.name}
              blurb={topic.blurb}
              index={index + 1}
              unlocked={unlocked}
              comingSoon={comingSoon}
              showMeter={!allOpen}
              meter={meter}
              current={!comingSoon && index === currentIndex}
              skipReady={skipReady}
              onOpen={() => setSection(topic.id)}
              onJump={() => setEventOpen(true)}
            />
          );
        })}
        <SectionCard
          kicker="Exam practice"
          title="Past year papers"
          blurb={
            pastPapers.length
              ? `${pastPapers.length} ${pastPapers.length === 1 ? "paper" : "papers"} ready to sit.`
              : "Question bank coming soon. Open this section when it is in."
          }
          index={topics.length + 1}
          badge="PY"
          unlocked
          showMeter={!allOpen}
          meter={{
            done: pastPapers.filter((p) => progress.completed?.includes(p.id))
              .length,
            total: Math.max(pastPapers.length, 1),
            pct: pastPapers.length
              ? Math.round(
                  (100 *
                    pastPapers.filter((p) =>
                      progress.completed?.includes(p.id)
                    ).length) /
                    pastPapers.length
                )
              : 0,
          }}
          current={false}
          skipReady={false}
          onOpen={() => setSection("papers")}
          onJump={() => setSection("papers")}
        />
      </div>
      {skipSheet}
    </div>
  );
}
