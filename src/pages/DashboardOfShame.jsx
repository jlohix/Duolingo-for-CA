import { useEffect, useMemo, useState } from "react";
import { QUESTION_CHANGES } from "../data/questionChanges.generated";
import {
  listQuestionOverridesRemote,
  listHiddenShameRemote,
  setShameHiddenRemote,
} from "../supabaseClient";
import { loadSession } from "../state/auth";
import MathText from "../components/MathText";

const OPTION_FIELDS = [
  ["optionA", "option_a", "Option A"],
  ["optionB", "option_b", "Option B"],
  ["optionC", "option_c", "Option C"],
  ["optionD", "option_d", "Option D"],
];

// Convert a live Supabase override row into Dashboard-of-Shame change entries,
// diffing its stored before-snapshot against the current (edited) values.
function overrideToEntry(o) {
  const before = o.before_json || {};
  const changes = [];
  const push = (field, label, b, a) => {
    const bv = String(b ?? "").trim();
    const av = String(a ?? "").trim();
    if (av !== "" && bv !== av) {
      changes.push({ field, label, before: bv, after: av });
    }
  };
  push("question", "Question text", before.question, o.question);
  for (const [field, col, label] of OPTION_FIELDS) {
    push(field, label, before[field], o[col]);
  }
  push("answer", "Correct answer", before.answer, o.answer);
  push("image", "Question image", before.image, o.image);
  if (!changes.length) return null;
  return {
    id: `override-${o.question_id}`,
    commit: "manual",
    date: String(o.updated_at || "").slice(0, 10),
    subject: o.edited_by ? `Edited by ${o.edited_by}` : "Manual admin edit",
    bankId: o.bank_id || "",
    bankTitle: o.bank_id || "Manual edit",
    questionId: o.question_id,
    changes,
    manual: true,
  };
}

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
  return <MathText className="dos-code" text={value} />;
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
  const [overrideEntries, setOverrideEntries] = useState([]);
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [pendingId, setPendingId] = useState(null);

  const session = loadSession();
  const hiddenBy = session?.username || "";

  // Pull live admin edits from Supabase and show them alongside the
  // git-derived history. Failure is non-fatal — we just show the git list.
  useEffect(() => {
    let active = true;
    listQuestionOverridesRemote()
      .then((rows) => {
        if (!active) return;
        const entries = (rows || [])
          .map(overrideToEntry)
          .filter(Boolean);
        setOverrideEntries(entries);
      })
      .catch(() => {
        if (active) setOverrideEntries([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Pull the shared set of admin-hidden entry ids. Students never see hidden
  // entries; admins see them greyed out with a Show toggle.
  useEffect(() => {
    let active = true;
    listHiddenShameRemote()
      .then((rows) => {
        if (!active) return;
        setHiddenIds(new Set((rows || []).map((r) => r.entry_id)));
      })
      .catch(() => {
        if (active) setHiddenIds(new Set());
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggleHidden(entryId) {
    const willHide = !hiddenIds.has(entryId);
    setPendingId(entryId);
    // Optimistic update.
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (willHide) next.add(entryId);
      else next.delete(entryId);
      return next;
    });
    try {
      await setShameHiddenRemote(entryId, willHide, hiddenBy);
    } catch {
      // Roll back on failure.
      setHiddenIds((prev) => {
        const next = new Set(prev);
        if (willHide) next.delete(entryId);
        else next.add(entryId);
        return next;
      });
    } finally {
      setPendingId(null);
    }
  }

  // Manual edits first (newest activity), then the git-derived history.
  const allChanges = useMemo(
    () => [...overrideEntries, ...QUESTION_CHANGES],
    [overrideEntries]
  );

  const banks = useMemo(() => {
    const seen = new Map();
    for (const e of allChanges) {
      if (!seen.has(e.bankId)) seen.set(e.bankId, e.bankTitle);
    }
    return [...seen.entries()];
  }, [allChanges]);

  const filtered = useMemo(() => {
    return allChanges
      .filter((e) => {
        // Students never see hidden entries; admins see all (greyed).
        if (!canEdit && hiddenIds.has(e.id)) return false;
        if (bankFilter !== "all" && e.bankId !== bankFilter) return false;
        if (
          kindFilter !== "all" &&
          !changeSummary(e.changes).includes(kindFilter)
        )
          return false;
        return true;
      })
      .map((e) => ({ ...e, hidden: hiddenIds.has(e.id) }));
  }, [allChanges, bankFilter, kindFilter, hiddenIds, canEdit]);

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
        the correct answer, or the diagram.
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
              <li
                key={entry.id}
                className={`profile-block change-item dos-item${
                  entry.hidden ? " dos-hidden" : ""
                }`}
              >
                <div className="change-head">
                  <p className="eyebrow">
                    {entry.date} · {entry.bankTitle} · Q{entry.questionId}
                    {canEdit && entry.hidden ? (
                      <span className="dos-hidden-tag"> · hidden from students</span>
                    ) : null}
                  </p>
                  {canEdit ? (
                    <button
                      type="button"
                      className="ghost dos-hide-btn"
                      onClick={() => toggleHidden(entry.id)}
                      disabled={pendingId === entry.id}
                    >
                      {pendingId === entry.id
                        ? "…"
                        : entry.hidden
                        ? "Show to students"
                        : "Hide from students"}
                    </button>
                  ) : null}
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
