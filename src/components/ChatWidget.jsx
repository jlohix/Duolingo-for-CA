import { useEffect, useRef, useState } from "react";
import { askChatbot, CHAT_HISTORY_LIMIT } from "../supabaseClient";
import MathText from "./MathText";
import {
  currentQuestionForChat,
  subscribeCurrentQuestion,
} from "../data/currentQuestion";

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
//   - The conversation persists for the whole browser session: closing the
//     panel just hides it, and messages are mirrored to sessionStorage so a
//     page refresh keeps the history. It clears only when the session ends
//     (tab/browser closed) or the student explicitly clears it.
//   - Each question sends the recent history (capped) so the bot can follow
//     up on earlier turns. RAG still runs on the latest message.

// sessionStorage lives until the browser tab/session is closed, which is
// exactly the lifetime we want for the chat history.
const CHAT_STORAGE_KEY = "chatbot:conversation";

function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Conversation so far. Each entry: { role: "user"|"model", text, sources? }
  // Seeded from sessionStorage so a refresh within the session keeps history.
  const [messages, setMessages] = useState(loadStoredMessages);
  // Whether the student currently has a question on screen (drives the small
  // "using your current question" hint). The actual context is read fresh at
  // send-time via currentQuestionForChat().
  const [hasQuestion, setHasQuestion] = useState(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Track whether a question is currently active on the page.
  useEffect(() => {
    return subscribeCurrentQuestion((q) => setHasQuestion(Boolean(q)));
  }, []);

  // Mirror the conversation to sessionStorage whenever it changes.
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full/unavailable: keep working from in-memory state.
    }
  }, [messages]);

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

  // Closing the panel just hides it. The conversation is kept for the rest of
  // the session (in state + sessionStorage) so reopening resumes where we left
  // off. History clears only when the browser session ends or the student
  // explicitly clears it via clearConversation().
  function closePanel() {
    setOpen(false);
    setError("");
    setInput("");
  }

  // Explicit reset so the student can start a fresh conversation on demand.
  function clearConversation() {
    setMessages([]);
    setError("");
    setInput("");
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (inputRef.current) inputRef.current.focus();
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
      // Send the recent conversation (capped) so the bot has memory, plus the
      // question the student is currently viewing (if any) so the tutor can
      // give guided, question-aware help.
      const history = priorHistory.slice(-CHAT_HISTORY_LIMIT);
      const currentQuestion = currentQuestionForChat();
      const { answer, sources } = await askChatbot(q, history, currentQuestion);
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
              <p className="chat-title">Ask the tutor (Under Development)</p>
              <p className="chat-subtitle">
                Grounded in your EE2101 lecture slides
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                className="chat-clear"
                onClick={clearConversation}
                aria-label="Clear conversation"
              >
                Clear
              </button>
            )}
          </div>

          {hasQuestion && (
            <p className="chat-context-note">
              📄 The tutor can see the question you're working on.
            </p>
          )}

          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 && !loading && !error && (
              <p className="chat-hint">
                {hasQuestion ? (
                  <>
                    Stuck on this question? Ask for a hint, e.g.{" "}
                    <em>“How do I start this?”</em>
                  </>
                ) : (
                  <>
                    Ask a circuit-analysis question, e.g.{" "}
                    <em>“What is Kirchhoff's voltage law?”</em>
                  </>
                )}
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
