import { useMemo, useState } from "react";
import { QUESTION_BANKS } from "../data/questionBanks";
import { loadSession } from "../state/auth";
import {
  upsertQuestionOverrideRemote,
  deleteQuestionOverrideRemote,
} from "../supabaseClient";

const LETTERS = ["a", "b", "c", "d"];

// Build the editable form state from a loaded question object.
function formFromQuestion(q) {
  return {
    question: q.question || "",
    optionA: q.options?.a || "",
    optionB: q.options?.b || "",
    optionC: q.options?.c || "",
    optionD: q.options?.d || "",
    answer: q.answer || "a",
    image: q.image || "",
    explanation: q.explanation || "",
  };
}

// The "before" snapshot stored alongside an override so the Dashboard of
// Shame can show the original values.
function beforeSnapshot(q) {
  return {
    question: q.question || "",
    optionA: q.options?.a || "",
    optionB: q.options?.b || "",
    optionC: q.options?.c || "",
    optionD: q.options?.d || "",
    answer: q.answer || "",
    image: q.image || "",
    explanation: q.explanation || "",
  };
}

export default function QuestionEditor({ questions = [], loaded = false }) {
  const session = loadSession();
  const editedBy = session?.username || "";

  const [bankId, setBankId] = useState(QUESTION_BANKS[0]?.id || "");
  const [questionId, setQuestionId] = useState("");
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null); // { kind: 'ok'|'err', msg }
  const [busy, setBusy] = useState(false);

  // Questions in the chosen bank, in order.
  const bankQuestions = useMemo(
    () => questions.filter((q) => q.bankId === bankId),
    [questions, bankId]
  );

  const current = useMemo(
    () => questions.find((q) => q.id === questionId) || null,
    [questions, questionId]
  );

  function pickQuestion(id) {
    setQuestionId(id);
    setStatus(null);
    const q = questions.find((x) => x.id === id);
    setForm(q ? formFromQuestion(q) : null);
  }

  function pickBank(id) {
    setBankId(id);
    setQuestionId("");
    setForm(null);
    setStatus(null);
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    if (!current || !form) return;
    setBusy(true);
    setStatus(null);
    try {
      await upsertQuestionOverrideRemote({
        questionId: current.id,
        bankId: current.bankId,
        question: form.question,
        optionA: form.optionA,
        optionB: form.optionB,
        optionC: form.optionC,
        optionD: form.optionD,
        answer: form.answer,
        image: form.image,
        explanation: form.explanation,
        before: beforeSnapshot(current),
        editedBy,
      });
      setStatus({
        kind: "ok",
        msg: "Saved. Every student sees this version after their next question load.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        msg:
          "Could not save. Check the Supabase question_overrides table is set up. " +
          (err?.message || ""),
      });
    } finally {
      setBusy(false);
    }
  }

  async function revert() {
    if (!current) return;
    setBusy(true);
    setStatus(null);
    try {
      await deleteQuestionOverrideRemote(current.id);
      setStatus({
        kind: "ok",
        msg: "Reverted to the original question-bank version.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        msg: "Could not revert. " + (err?.message || ""),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Edit questions</h1>
        </div>
      </header>
      <p className="focus-line">
        Change a question's wording, options, correct answer, image, or
        explanation. Edits are saved to the shared database and apply on every
        student's device. Changes also appear in the Dashboard of Shame.
      </p>

      {!loaded ? (
        <p className="focus-line">Loading questions…</p>
      ) : (
        <div className="profile-block qed-pickers">
          <label>
            Topic
            <select value={bankId} onChange={(e) => pickBank(e.target.value)}>
              {QUESTION_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Question
            <select
              value={questionId}
              onChange={(e) => pickQuestion(e.target.value)}
            >
              <option value="">Select a question…</option>
              {bankQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.csvId} — {String(q.question || "").slice(0, 60)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {current && form ? (
        <form className="profile-block qed-form" onSubmit={save}>
          <h2>
            {current.csvId}
            {current.overridden ? (
              <span className="qed-flag"> · currently overridden</span>
            ) : null}
          </h2>

          <label>
            Question text
            <textarea
              rows={3}
              value={form.question}
              onChange={(e) => setField("question", e.target.value)}
            />
          </label>

          {LETTERS.map((letter) => {
            const key = `option${letter.toUpperCase()}`;
            return (
              <label key={key}>
                Option {letter.toUpperCase()}
                <input
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                />
              </label>
            );
          })}

          <label>
            Correct answer
            <select
              value={form.answer}
              onChange={(e) => setField("answer", e.target.value)}
            >
              {LETTERS.map((l) => (
                <option key={l} value={l}>
                  Option {l.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label>
            Image URL
            <input
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              placeholder="https://…/question.png"
            />
          </label>
          {form.image ? (
            <img className="qed-preview" src={form.image} alt="Question image preview" />
          ) : null}

          <label>
            Explanation
            <textarea
              rows={3}
              value={form.explanation}
              onChange={(e) => setField("explanation", e.target.value)}
            />
          </label>

          {status ? (
            <p className={status.kind === "ok" ? "qed-ok" : "qed-err"}>
              {status.msg}
            </p>
          ) : null}

          <div className="qed-actions">
            <button type="submit" className="primary" disabled={busy}>
              {busy ? "Saving…" : "Save for everyone"}
            </button>
            {current.overridden ? (
              <button
                type="button"
                className="ghost"
                onClick={revert}
                disabled={busy}
              >
                Revert to original
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
