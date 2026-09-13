import { useEffect, useMemo, useRef } from "react";
import MathText from "../components/MathText";
import OhmLabSchematic from "../components/OhmLabSchematic";
import PowerSchematic from "../components/PowerSchematic";
import MaxPowerSchematic from "../components/MaxPowerSchematic";
import DependentSchematic from "../components/DependentSchematic";
import {
  InvertingSchematic,
  NonInvertingSchematic,
} from "../components/OpAmpSchematics";
import DividerBranchesSchematic, {
  DividerBranchesDragBoard,
} from "../components/DividerBranchesSchematic";
import SourceTransformationSchematic from "../components/SourceTransformationSchematic";
import Section2Schematic from "../section2/Schematics";
import Section3Schematic from "../section3/Schematics";
import { PracticeBoard as Section3PracticeBoard } from "../section3/PracticeSchematics";
import Section4Schematic from "../section4/Schematics";
import FreeCQuizDragBoard from "../section4/FreeCQuizDragBoard";
import FreeLQuizDragBoard from "../section4/FreeLQuizDragBoard";
import StepCQuizDragBoard from "../section4/StepCQuizDragBoard";
import StepLQuizDragBoard from "../section4/StepLQuizDragBoard";
import { LaplaceSchematic } from "../section5";
import { isAdmin, loadSession } from "../state/auth";
import {
  buildQuestionPack,
  dragCorrect,
  formatDragChoice,
  isDragChoiceCorrect,
  ohmBoardNote,
  packItemCount,
} from "../data/questionPack";

const LETTERS = ["a", "b", "c", "d", "e", "f"];

function DummySlot({ Board, question, placed }) {
  const slotRef = useRef(null);
  return (
    <Board
      question={question}
      placed={placed}
      drag={null}
      revealed
      ok
      hard={false}
      slotRef={slotRef}
      practice
      highlight="rf"
    />
  );
}

function PackBoard({ item }) {
  const question = item.question;
  const placed = question ? dragCorrect(question) : null;
  const note = question ? ohmBoardNote(question) : "";

  if (item.board === "image") {
    return item.image ? (
      <img className="pack-fig" src={item.image} alt="" />
    ) : null;
  }

  if (item.board === "ohm" && question) {
    const dropValue = question.quiz ? null : placed;
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={OhmLabSchematic} question={question} placed={dropValue} />
        {note ? (
          <p className="circuit-current">
            <MathText text={note} />
          </p>
        ) : null}
      </div>
    );
  }

  if (item.board === "power" && question) {
    return (
      <div className="circuit-board pack-board">
        <PowerSchematic
          question={question}
          highlight="p"
          view={question.shape}
        />
        {note ? (
          <p className="circuit-current">
            <MathText text={note} />
          </p>
        ) : null}
      </div>
    );
  }

  if (item.board === "mpt" && question) {
    return (
      <div className="circuit-board pack-board">
        <MaxPowerSchematic
          question={question}
          highlight={
            question.shape === "pmax"
              ? "p"
              : question.shape === "match"
                ? "load"
                : "all"
          }
          view={question.shape}
        />
        {note ? (
          <p className="circuit-current">
            <MathText text={note} />
          </p>
        ) : null}
      </div>
    );
  }

  if (item.board === "dep" && question) {
    return (
      <div className="circuit-board pack-board">
        <DependentSchematic
          question={question}
          highlight="dep"
          view={question.shape}
        />
        {note ? (
          <p className="circuit-current">
            <MathText text={note} />
          </p>
        ) : null}
      </div>
    );
  }

  if (item.board === "inv" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={InvertingSchematic} question={question} placed={placed} />
      </div>
    );
  }

  if (item.board === "ninv" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot
          Board={NonInvertingSchematic}
          question={question}
          placed={placed}
        />
      </div>
    );
  }

  if (item.board === "st") {
    return (
      <div className="circuit-board pack-board">
        <SourceTransformationSchematic />
      </div>
    );
  }

  if (item.board === "divider") {
    return (
      <div className="circuit-board pack-board">
        <DividerBranchesSchematic
          view={item.view}
          highlight={item.highlight || "all"}
        />
      </div>
    );
  }

  if (item.board === "divider-drag" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot
          Board={DividerBranchesDragBoard}
          question={question}
          placed={placed}
        />
      </div>
    );
  }

  if (item.board === "s2") {
    return (
      <div className="circuit-board pack-board">
        <Section2Schematic view={item.view} highlight={item.highlight || "all"} />
      </div>
    );
  }

  if (item.board === "s3") {
    return (
      <div className="circuit-board pack-board">
        <Section3Schematic view={item.view} highlight={item.highlight || "all"} />
      </div>
    );
  }

  if (item.board === "s3-test") {
    return (
      <div className="circuit-board pack-board">
        <Section3PracticeBoard view={item.view} />
      </div>
    );
  }

  if (item.board === "s4") {
    return (
      <div className="circuit-board pack-board">
        <Section4Schematic view={item.view} highlight={item.highlight || "all"} />
      </div>
    );
  }

  if (item.board === "s4-freec" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={FreeCQuizDragBoard} question={question} placed={placed} />
      </div>
    );
  }

  if (item.board === "s4-freel" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={FreeLQuizDragBoard} question={question} placed={placed} />
      </div>
    );
  }

  if (item.board === "s4-stepc" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={StepCQuizDragBoard} question={question} placed={placed} />
      </div>
    );
  }

  if (item.board === "s4-stepl" && question) {
    return (
      <div className="circuit-board pack-board">
        <DummySlot Board={StepLQuizDragBoard} question={question} placed={placed} />
      </div>
    );
  }

  if (item.board === "laplace") {
    return (
      <div className="circuit-board pack-board">
        <LaplaceSchematic view={item.view} highlight={item.highlight || "all"} />
      </div>
    );
  }

  return item.image ? (
    <img className="pack-fig" src={item.image} alt="" />
  ) : null;
}

function OptionList({ item }) {
  if (item.type === "drag") {
    const question = item.question;
    return (
      <ul className="pack-options">
        {(item.choices || []).map((choice, index) => {
          const ok = isDragChoiceCorrect(question, choice);
          return (
            <li
              key={index}
              className={ok ? "pack-option is-answer" : "pack-option"}
            >
              <span className="pack-letter">{LETTERS[index]?.toUpperCase()}</span>
              <MathText text={formatDragChoice(question, choice)} />
              {ok ? <span className="pack-tag">Answer</span> : null}
            </li>
          );
        })}
      </ul>
    );
  }

  const options = item.options || {};
  return (
    <ul className="pack-options">
      {Object.entries(options)
        .filter(([, text]) => text)
        .map(([letter, text]) => {
          const ok = letter === item.answer;
          return (
            <li
              key={letter}
              className={ok ? "pack-option is-answer" : "pack-option"}
            >
              <span className="pack-letter">{letter.toUpperCase()}</span>
              <MathText text={text} />
              {ok ? <span className="pack-tag">Answer</span> : null}
            </li>
          );
        })}
    </ul>
  );
}

function PackCard({ item, index }) {
  return (
    <article className="pack-card">
      <p className="pack-qnum">
        Q{index + 1}
        {item.level === "hard" ? " · Hard" : ""}
        {item.type === "drag" ? " · Drag" : ""}
      </p>
      <p className="focus-line">
        <MathText text={item.prompt} />
      </p>
      {item.boardHint ? (
        <p className="login-hint">
          <MathText text={item.boardHint} />
        </p>
      ) : null}
      <PackBoard item={item} />
      <OptionList item={item} />
      {item.why ? (
        <p className="pack-why">
          <strong>Why: </strong>
          <MathText text={item.why} />
        </p>
      ) : null}
    </article>
  );
}

export default function QuestionPack({ questions = [], loaded = true }) {
  const allowed = isAdmin(loadSession());
  const sections = useMemo(
    () => buildQuestionPack(questions),
    [questions]
  );
  const total = packItemCount(sections);

  useEffect(() => {
    if (!allowed) return undefined;
    document.body.classList.add("pack-print");
    return () => document.body.classList.remove("pack-print");
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="page">
        <header>
          <p className="eyebrow">Staff</p>
          <h1>Staff only</h1>
        </header>
        <p className="login-hint">This question pack is for admins.</p>
      </div>
    );
  }

  function printPack() {
    window.print();
  }

  return (
    <div className="page question-pack">
      <header className="pack-toolbar">
        <p className="eyebrow">Staff</p>
        <h1>Question pack</h1>
        <p className="login-hint">
          Every quiz and drag lab, with sketches and answers. Print or Save as
          PDF from this page. Students do not see this.
        </p>
        {!loaded ? (
          <p className="login-hint">Loading topic quizzes…</p>
        ) : null}
        <p className="pack-count">{total} questions</p>
        <button type="button" className="primary" onClick={printPack}>
          Print / Save PDF
        </button>
      </header>

      <nav className="pack-toc" aria-label="Question pack sections">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
            <span>{section.items.length}</span>
          </a>
        ))}
      </nav>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="pack-section">
          <h2>
            {section.title}
            <span className="pack-count"> {section.items.length}</span>
          </h2>
          {section.items.map((item, index) => (
            <PackCard key={`${section.id}-${item.id}-${index}`} item={item} index={index} />
          ))}
        </section>
      ))}
    </div>
  );
}
