import { useEffect, useRef, useState } from "react";
import { askChatbot, CHAT_HISTORY_LIMIT } from "../supabaseClient";
import MathText from "./MathText";

// Turn a source filename like "EE2101_Lecture_Week03.pdf" into "Week 3".
function prettySource(source) {
  const raw = String(source || "");
  const week = raw.match(/week\s*0*(\d+)/i);
  if (week) return `Week ${Number(week[1])}`;
  return raw.replace(/\.pdf$/i, "");
}

// Floating "Ask the tutor" chatbot with per-session conversation memory.
//
// Memory model:
//   - Messages live in React state only. The conversation resets when the
//     student closes the panel, refreshes the page, or logs out (the whole
//     component unmounts / state is discarded). Nothing is persisted.
//   - Each question sends the recent history (capped) so the bot can follow
//     up on earlier turns. RAG still runs on the latest message.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Conversation so far. Each entry: { role: "user"|"model", text, sources? }
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Keep the conversation scrolled to the latest message.
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Closing the panel ends the session: clear the conversation.
  function closePanel() {
    setOpen(false);
    setMessages([]);
    setError("");
    setInput("");
  }

  async function handleAsk(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    // Optimistically show the student's message, then ask.
    const priorHistory = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      // Send the recent conversation (capped) so the bot has memory.
      const history = priorHistory.slice(-CHAT_HISTORY_LIMIT);
      const { answer, sources } = await askChatbot(q, history);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: answer, sources },
      ]);
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
        onClick={() => (open ? closePanel() : setOpen(true))}
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

          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 && !loading && !error && (
              <p className="chat-hint">
                Ask a circuit-analysis question, e.g.{" "}
                <em>“What is Kirchhoff's voltage law?”</em>
              </p>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="chat-msg chat-msg-user">
                  <div className="chat-bubble chat-bubble-user">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="chat-msg chat-msg-bot">
                  <MathText className="chat-bubble" text={m.text} markdown />
                  {m.sources && m.sources.length > 0 && (
                    <p className="chat-sources">
                      Sources: {m.sources.map(prettySource).join(", ")}
                    </p>
                  )}
                </div>
              )
            )}

            {loading && <p className="chat-thinking">Thinking…</p>}
            {error && <p className="chat-error">{error}</p>}
          </div>

          <form className="chat-input-row" onSubmit={handleAsk}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chat-send"
              disabled={loading || !input.trim()}
            >
              {loading ? "…" : "Ask"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
