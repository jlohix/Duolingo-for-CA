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

// Inline Markdown (bold / italic / inline code) applied to an already
// HTML-escaped string. Bold (**/__) is handled before italic (*/_) so "**x**"
// is not mistaken for two italics.
function renderInlineMarkdown(escaped) {
  return escaped
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
}

// Convert the common Markdown structures the model emits into HTML. Works on an
// already HTML-escaped string in which math spans have been replaced by opaque
// placeholder tokens, so equations are never split by list/heading parsing.
// Handles: headings (#..######), horizontal rules (--- / *** / ___),
// unordered lists (- / * / +), ordered lists (1. 2. ...), and line breaks.
function renderBlockMarkdown(escaped) {
  const lines = escaped.split("\n");
  const out = [];
  let listType = null; // "ul" | "ol" | null
  let paragraph = []; // buffered plain lines

  const closeList = () => {
    if (listType) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
      paragraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      closeList();
      continue;
    }

    // Horizontal rule: --- , *** , ___ (3+).
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      flushParagraph();
      closeList();
      out.push("<hr>");
      continue;
    }

    // Heading: #..###### text  ->  scaled down so # becomes h3.
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(heading[1].length + 2, 6);
      out.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    // Unordered list item: - , * , +
    const ul = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${renderInlineMarkdown(ul[1])}</li>`);
      continue;
    }

    // Ordered list item: 1. 2. ... or 1) 2) ...
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${renderInlineMarkdown(ol[1])}</li>`);
      continue;
    }

    // Plain line: buffer into the current paragraph.
    closeList();
    paragraph.push(line);
  }
  flushParagraph();
  closeList();

  return out.join("");
}

export function textToReadableHtml(source, options = {}) {
  const { sentenceLines = false, markdown = false } = options;
  const raw = String(source ?? "");

  // Extract math spans first and replace them with opaque placeholders so that
  // neither HTML-escaping nor Markdown parsing can corrupt or split equations.
  const mathHtml = [];
  const PLACEHOLDER = (i) => `\u0000MATH${i}\u0000`;
  const withPlaceholders = raw.replace(
    MATH_RE,
    (match, dd, inline, paren, bracket) => {
      const idx = mathHtml.length;
      mathHtml.push(
        renderMath(dd || inline || paren || bracket, Boolean(dd || bracket)),
      );
      return PLACEHOLDER(idx);
    },
  );

  // Process the plain text (now math-free).
  let out = escapeHtml(withPlaceholders);
  if (markdown) {
    out = renderBlockMarkdown(out);
  } else {
    out = out.replaceAll("\n", "<br>");
  }
  if (sentenceLines) out = breakSentences(out);

  // Restore rendered math in place of the placeholders.
  out = out.replace(/\u0000MATH(\d+)\u0000/g, (_, i) => mathHtml[Number(i)] ?? "");
  return out;
}
