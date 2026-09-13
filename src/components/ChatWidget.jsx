import { useEffect, useRef, useState } from "react";
import { askChatbot } from "../supabaseClient";
import MathText from "./MathText";

// Turn a source filename like "EE2101_Lecture_Week03.pdf" into "Week 3".
function prettySource(source) {
  const raw = String(source || "");
  const week = raw.match(/week\s*0*(\d+)/i);
  if (week) return `Week ${Number(week[1])}`;
  return raw.replace(/\.pdf$/i, "");
}

// Floating "Ask the tutor" chatbot. Single-question mode: each question is
// answered independently (no conversation memory) against the RAG backend.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null); // { text, sources }
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  async function handleAsk(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const { answer: text, sources } = await askChatbot(q);
      setAnswer({ text, sources });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={`chat-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close the tutor" : "Ask the tutor"}
        aria-expanded={open}
      >
        {open ? "✕" : "Ask the tutor"}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Ask the tutor">
          <div className="chat-header">
            <div>
              <p className="chat-title">Ask the tutor</p>
              <p className="chat-subtitle">
                Grounded in your EE2101 lecture slides
              </p>
            </div>
          </div>

          <div className="chat-body">
            {!answer && !loading && !error && (
              <p className="chat-hint">
                Ask a circuit-analysis question, e.g.{" "}
                <em>“What is Kirchhoff's voltage law?”</em>
              </p>
            )}

            {loading && <p className="chat-thinking">Thinking…</p>}

            {error && <p className="chat-error">{error}</p>}

            {answer && (
              <div className="chat-msg">
                <MathText className="chat-bubble" text={answer.text} />
                {answer.sources.length > 0 && (
                  <p className="chat-sources">
                    Sources:{" "}
                    {answer.sources.map(prettySource).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleAsk}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type your question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-send"
              disabled={loading || !question.trim()}
            >
              {loading ? "…" : "Ask"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
