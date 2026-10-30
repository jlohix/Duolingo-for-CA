import { useMemo, useState } from "react";
import { QUESTION_CHANGES } from "../data/questionChanges.generated";

const PREVIEW = 8;

const FIELD_ORDER = {
  question: 0,
  optionA: 1,
  optionB: 2,
  optionC: 3,
  optionD: 4,
  answer: 5,
  image: 6,
};

// Human summary of what kinds of things changed in one entry.
function changeSummary(changes) {
  const kinds = new Set();
  for (const c of changes) {
    if (c.field === "question") kinds.add("question");
    else if (c.field === "image") kinds.add("image");
    else if (c.field === "answer") kinds.add("answer");
    else kinds.add("options");
  }
  const order = ["question", "options", "answer", "image"];
  return order.filter((k) => kinds.has(k));
}

const KIND_LABEL = {
  question: "Question edited",
  options: "Options edited",
  answer: "Answer changed",
  image: "Image changed",
};

function isImageUrl(value) {
  return /^https?:\/\//i.test(value) && /\.(png|jpe?g|gif|webp|svg)/i.test(value);
}

function ValueBlock({ value, isImage }) {
  if (!value) {
    return <span className="dos-empty">(empty)</span>;
  }
  if (isImage && isImageUrl(value)) {
    return (
      <img
        className="dos-img"
        src={value}
        alt="Question diagram version"
        loading="lazy"
      />
    );
  }
  return <code className="dos-code">{value}</code>;
}

function ChangeRow({ change }) {
  const isImage = change.field === "image";
  return (
    <div className="dos-change">
      <p className="eyebrow dos-field">{change.label}</p>
      <div className="dos-ba">
        <div className="dos-col dos-before">
          <span className="dos-tag">Before</span>
          <ValueBlock value={change.before} isImage={isImage} />
        </div>
        <div className="dos-col dos-after">
          <span className="dos-tag">After</span>
          <ValueBlock value={change.after} isImage={isImage} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOfShame({ canEdit = false }) {
  const [expanded, setExpanded] = useState(false);
  const [bankFilter, setBankFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");

  const banks = useMemo(() => {
    const seen = new Map();
    for (const e of QUESTION_CHANGES) {
      if (!seen.has(e.bankId)) seen.set(e.bankId, e.bankTitle);
    }
    return [...seen.entries()];
  }, []);

  const filtered = useMemo(() => {
    return QUESTION_CHANGES.filter((e) => {
      if (bankFilter !== "all" && e.bankId !== bankFilter) return false;
      if (kindFilter !== "all" && !changeSummary(e.changes).includes(kindFilter))
        return false;
      return true;
    });
  }, [bankFilter, kindFilter]);

  const visible = expanded ? filtered : filtered.slice(0, PREVIEW);
  const hiddenCount = Math.max(0, filtered.length - PREVIEW);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">{canEdit ? "Staff" : "Help"}</p>
          <h1>Dashboard of Shame</h1>
        </div>
      </header>
      <p className="focus-line">
        Every change ever made to a question — the wording, the answer options,
        the correct answer, or the diagram. Each entry shows the question
        before and after it was fixed, straight from the question-bank history.
      </p>

      <div className="dos-filters">
        <label>
          Topic
          <select
            value={bankFilter}
            onChange={(e) => {
              setBankFilter(e.target.value);
              setExpanded(false);
            }}
          >
            <option value="all">All topics</option>
            {banks.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Change type
          <select
            value={kindFilter}
            onChange={(e) => {
              setKindFilter(e.target.value);
              setExpanded(false);
            }}
          >
            <option value="all">All changes</option>
            <option value="question">Question text</option>
            <option value="options">Answer options</option>
            <option value="answer">Correct answer</option>
            <option value="image">Question image</option>
          </select>
        </label>
        <p className="dos-count">
          {filtered.length} change{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="focus-line">No question changes match this filter.</p>
      ) : (
        <ol className="change-log dos-log">
          {visible.map((entry) => {
            const sorted = [...entry.changes].sort(
              (a, b) => FIELD_ORDER[a.field] - FIELD_ORDER[b.field]
            );
            return (
              <li key={entry.id} className="profile-block change-item dos-item">
                <div className="change-head">
                  <p className="eyebrow">
                    {entry.date} · {entry.bankTitle} · Q{entry.questionId}
                  </p>
                </div>
                <div className="dos-badges">
                  {changeSummary(entry.changes).map((k) => (
                    <span key={k} className={`dos-badge dos-badge-${k}`}>
                      {KIND_LABEL[k]}
                    </span>
                  ))}
                </div>
                {entry.subject ? (
                  <p className="dos-subject">“{entry.subject}”</p>
                ) : null}
                {sorted.map((change, i) => (
                  <ChangeRow key={`${entry.id}-${i}`} change={change} />
                ))}
              </li>
            );
          })}
        </ol>
      )}

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="ghost change-more"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded
            ? `Show latest ${PREVIEW}`
            : `Show ${hiddenCount} older change${hiddenCount === 1 ? "" : "s"}`}
        </button>
      ) : null}
    </div>
  );
}
