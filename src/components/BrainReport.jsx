function tone(pct) {
  if (pct >= 70) return "high";
  if (pct >= 40) return "mid";
  return "low";
}

export default function BrainReport({ rows = [] }) {
  if (!rows.length) return null;
  return (
    <section className="brain-report" aria-label="Your Brain Report">
      <h2>Your Brain Report 🧠</h2>
      <ul>
        {rows.map((row) => (
          <li key={row.name}>
            <div className="brain-report-head">
              <span>{row.name}</span>
              <span>{row.pct}%</span>
            </div>
            <div className="brain-report-track">
              <div
                className={`brain-report-fill ${tone(row.pct)}`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
