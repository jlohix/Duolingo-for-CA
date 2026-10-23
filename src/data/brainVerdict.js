/** Sample marks an admin can preview. Shared edges belong to the higher band. */
export const BRAIN_REMARK_BANDS = [
  { id: "low", marks: 12, label: "Under 25" },
  { id: "hope", marks: 30, label: "25–34" },
  { id: "solid", marks: 37, label: "35–39" },
  { id: "nobel", marks: 42, label: "40–44" },
  { id: "sunwoo", marks: 48, label: "45–50" },
];

/** Score bands for No Pen, Just Brains. Shared edges belong to the higher band. */
export function brainVerdict(correct) {
  const score = Number(correct) || 0;
  if (score >= 45) {
    return {
      id: "sunwoo",
      line: "Congrats, you are Prof Sunwoo's favourite student!!",
      mascot: true,
    };
  }
  if (score >= 40) {
    return {
      id: "nobel",
      line: "At this point, you might be future Nobel Prize winner",
      prize: true,
    };
  }
  if (score >= 35) {
    return { id: "solid", line: "Kirchhoff is almost impressed" };
  }
  if (score >= 25) {
    return { id: "hope", line: "We asked for brainpower, not thoughts and prayers" };
  }
  return {
    id: "kirchhoff",
    line: "Kirchhoff is disappointed in you",
    portrait: true,
  };
}

/** First-try score in each Learn section, in the order the questions appear. */
export function brainSectionReport(questions, correctIds) {
  const ids = correctIds instanceof Set ? correctIds : new Set(correctIds || []);
  const rows = [];
  const index = new Map();
  for (const question of questions || []) {
    const name = String(question.mainQuestion || "").trim() || "Other";
    let row = index.get(name);
    if (!row) {
      row = { name, correct: 0, total: 0 };
      index.set(name, row);
      rows.push(row);
    }
    row.total += 1;
    if (ids.has(question.id)) row.correct += 1;
  }
  return rows.map((row) => ({
    ...row,
    pct: row.total ? Math.round((100 * row.correct) / row.total) : 0,
  }));
}
