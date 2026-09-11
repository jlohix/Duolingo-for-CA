import { useEffect, useState } from "react";
import { loadSession } from "../state/auth";
import {
  REPORT_REASONS,
  submitQuestionReport,
} from "../state/questionReports";

export default function QuestionReport({ question }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOpen(false);
    setReason("wrong");
    setNote("");
    setDone(false);
    setError("");
  }, [question?.id]);

  if (!question?.id) return null;

  function send(event) {
    event.preventDefault();
    setError("");
    const session = loadSession();
    const result = submitQuestionReport({
      questionId: question.id,
      questionText: question.question,
      reason,
      note,
      reporter: session?.username || "",
    });
    if (!result.ok) {
      setError(result.error || "Could not send report.");
      return;
    }
    setDone(true);
    setOpen(false);
    setNote("");
  }

  if (done) {
    return (
      <div className="question-report">
        <p className="question-report-thanks">Thanks — we got your report.</p>
      </div>
    );
  }

  return (
    <div className="question-report">
      {!open ? (
        <button
          type="button"
          className="question-report-toggle"
          onClick={() => setOpen(true)}
        >
          Report question
        </button>
      ) : (
        <form className="question-report-form" onSubmit={send}>
          <p className="question-report-prompt">Why are you reporting this?</p>
          <fieldset className="question-report-reasons">
            <legend className="sr-only">Report reason</legend>
            {REPORT_REASONS.map((row) => (
              <label key={row.id} className="question-report-reason">
                <input
                  type="radio"
                  name={`report-${question.id}`}
                  value={row.id}
                  checked={reason === row.id}
                  onChange={() => setReason(row.id)}
                />
                <span>{row.label}</span>
              </label>
            ))}
          </fieldset>
          <label className="question-report-note">
            <span>Optional details</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              maxLength={400}
              placeholder="What looks wrong?"
            />
          </label>
          {error ? <p className="question-report-error">{error}</p> : null}
          <div className="question-report-actions">
            <button type="submit" className="question-report-send">
              Send report
            </button>
            <button
              type="button"
              className="question-report-cancel"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
