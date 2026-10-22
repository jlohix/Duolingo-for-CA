import Section7Schematic, { SECTION7_BOARD_VIEWS } from "../section7/Schematics";
import Section8Schematic, { SECTION8_BOARD_VIEWS } from "../section8/Schematics";

function Board({ section, view }) {
  const Schematic = section === 7 ? Section7Schematic : Section8Schematic;
  return (
    <section className="s78-item" id={`s${section}-${view}`}>
      <h2>
        S{section} · {view}
      </h2>
      <div className="circuit-board">
        <Schematic view={view} />
      </div>
    </section>
  );
}

export default function S78Gallery() {
  return (
    <div style={{ padding: "8px 8px 480px", display: "grid", gap: 24, maxWidth: 560, margin: 0 }}>
      <h1 style={{ fontSize: 18, margin: 0 }}>Section 7 / 8 board gallery</h1>
      {SECTION7_BOARD_VIEWS.map((view) => (
        <Board key={`7-${view}`} section={7} view={view} />
      ))}
      {SECTION8_BOARD_VIEWS.map((view) => (
        <Board key={`8-${view}`} section={8} view={view} />
      ))}
    </div>
  );
}
