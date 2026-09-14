import katex from "katex";

const MATH_RE =
  /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMath(tex, display) {
  try {
    return katex.renderToString(String(tex ?? ""), {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return `<span class="math-fallback">${escapeHtml(tex)}</span>`;
  }
}

// Insert a line break after sentence-ending punctuation, so each sentence
// starts on its own line. Only applied to PLAIN (non-math) text segments, so
// equations are never split. We break after ". ", "? " or "! " only when the
// next non-space character starts a new sentence (a capital letter or a "$"
// beginning a math span). This avoids breaking on decimals like "1.5" or on a
// period that ends the whole string.
function breakSentences(escapedText) {
  return escapedText.replace(/([.!?])\s+(?=[A-Z$])/g, "$1<br>");
}

export function textToReadableHtml(source, options = {}) {
  const { sentenceLines = false } = options;
  const raw = String(source ?? "");
  let last = 0;
  const html = [];

  const renderPlain = (text) => {
    let out = escapeHtml(text).replaceAll("\n", "<br>");
    if (sentenceLines) out = breakSentences(out);
    return out;
  };

  raw.replace(MATH_RE, (match, dd, inline, paren, bracket, offset) => {
    html.push(renderPlain(raw.slice(last, offset)));
    html.push(renderMath(dd || inline || paren || bracket, Boolean(dd || bracket)));
    last = offset + match.length;
    return match;
  });
  html.push(renderPlain(raw.slice(last)));
  return html.join("");
}
