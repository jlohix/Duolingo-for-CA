import { unitPillText } from "../data/topicUnits";

export default function UnitPills({ units, completed = [] }) {
  if (!units?.length) return null;
  return (
    <ul className="progress-diffs">
      {units.map((unit) => {
        const done = completed.includes(unit.key);
        return (
          <li
            key={unit.key}
            className={`progress-pill ${done ? "done" : ""}`}
          >
            {unitPillText(unit, done)}
          </li>
        );
      })}
    </ul>
  );
}
