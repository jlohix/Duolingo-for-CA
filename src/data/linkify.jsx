// Turn plain text into React nodes where any http(s) URL becomes a clickable
// link that opens in a new tab. Safe: renders real text + <a> nodes, never raw
// HTML, so there's no injection risk. Trailing punctuation that commonly
// follows a URL in prose is kept out of the link. Shared by announcements and
// the inbox.

const URL_RE = /(https?:\/\/[^\s]+)/g;

export function linkify(text) {
  const str = String(text || "");
  const parts = str.split(URL_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const m = part.match(/^(.*?)([.,!?;:)\]]*)$/);
      const url = m ? m[1] : part;
      const trail = m ? m[2] : "";
      return (
        <span key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
          {trail}
        </span>
      );
    }
    return part;
  });
}
