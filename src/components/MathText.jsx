import { textToReadableHtml } from "../data/readableMath";

export default function MathText({
  text,
  className = "",
  sentenceLines = false,
  markdown = false,
}) {
  if (!text) return null;
  return (
    <span
      className={`math-text ${className}`.trim()}
      dangerouslySetInnerHTML={{
        __html: textToReadableHtml(text, { sentenceLines, markdown }),
      }}
    />
  );
}
