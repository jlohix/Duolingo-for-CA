// A tiny module-level store for the question the student is currently viewing,
// so the floating ChatWidget (mounted at the app root) can read it without
// prop-drilling through the whole tree. The Lesson page publishes the active
// question here; ChatWidget subscribes and sends it along with chat requests.
//
// Shape published: { id, question, options: {a,b,c,d}, answer, explanation,
// image, topicId, difficulty, paper } — or null when no question is active.

let current = null;
const listeners = new Set();

function emit() {
  for (const fn of listeners) {
    try {
      fn(current);
    } catch {
      // a broken listener shouldn't break publishing
    }
  }
}

// Publish the active question (or null to clear). Called by the Lesson page.
export function setCurrentQuestion(q) {
  if (!q) {
    if (current === null) return;
    current = null;
    emit();
    return;
  }
  current = {
    id: q.id ?? null,
    question: String(q.question ?? ""),
    options: q.options ?? null,
    answer: q.answer ?? null,
    explanation: q.explanation ? String(q.explanation) : "",
    image: q.image ? String(q.image) : "",
    topicId: q.topicId ?? null,
    difficulty: q.difficulty ?? null,
    paper: q.paper ?? null,
  };
  emit();
}

export function getCurrentQuestion() {
  return current;
}

// Subscribe to changes. Returns an unsubscribe function.
export function subscribeCurrentQuestion(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Build the compact context object sent to the chat Edge Function. Keeps only
// what the tutor needs and caps sizes so the prompt stays small.
export function currentQuestionForChat() {
  if (!current) return null;
  const clip = (s, n) => String(s ?? "").slice(0, n);
  const ctx = {
    question: clip(current.question, 1200),
  };
  if (current.options && typeof current.options === "object") {
    ctx.options = {
      a: clip(current.options.a, 300),
      b: clip(current.options.b, 300),
      c: clip(current.options.c, 300),
      d: clip(current.options.d, 300),
    };
  }
  if (current.answer) ctx.answer = String(current.answer);
  if (current.explanation) ctx.explanation = clip(current.explanation, 1500);
  return ctx;
}
