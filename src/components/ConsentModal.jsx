import { useState } from "react";
import {
  CONSENT_FORM_HREF,
  consentError,
  emptyConsentAnswers,
} from "../data/consent";
import { recordStudentConsent } from "../supabaseClient";

export default function ConsentModal({ email, onSaved }) {
  const [answers, setAnswers] = useState(() => emptyConsentAnswers());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setField(key, value) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "futureData" && value !== "yes") next.futureDataScope = "";
      if (key === "futureContact" && value !== "yes") next.contactEmail = false;
      return next;
    });
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    const problem = consentError(answers);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ok = await recordStudentConsent(email, answers);
      if (!ok) {
        setError("Could not save your consent. Please try again.");
        return;
      }
      onSaved();
    } catch {
      setError("Could not save your consent. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay consent-overlay" role="presentation">
      <form
        className="event-sheet consent-sheet"
        role="dialog"
        aria-labelledby="consent-title"
        aria-modal="true"
        onSubmit={submit}
      >
        <p className="eyebrow">Research study</p>
        <h2 id="consent-title">Informed consent</h2>
        <p>
          Please read the study information and choose your options below.
          Taking part in the study (sections 1–3) is required to use Circuito.
          You may opt out of being contacted about future studies (section 4)
          and still use the app.
        </p>
        <p>
          <a href={CONSENT_FORM_HREF} target="_blank" rel="noreferrer">
            Open the full consent form
          </a>
        </p>

        <fieldset className="consent-block">
          <legend>1. Taking part</legend>
          <p>
            I have read the purpose of the study and the attached consent form.
            I voluntarily consent to take part. I understand I may withdraw at
            any time without penalty. I consent to the collection, use and
            disclosure of my personal data for the purposes in the study
            information sheet. I agree I may be contacted for additional
            consent if the research changes.
          </p>
          <label className={answers.study === "yes" ? "on" : ""}>
            <input
              type="radio"
              name="study"
              checked={answers.study === "yes"}
              onChange={() => setField("study", "yes")}
            />
            I have read and understood the consent form. I am willing to take
            part in the study.
          </label>
          <label className={answers.study === "no" ? "on" : ""}>
            <input
              type="radio"
              name="study"
              checked={answers.study === "no"}
              onChange={() => setField("study", "no")}
            />
            I do not wish to participate in this study.
          </label>
        </fieldset>

        <fieldset className="consent-block">
          <legend>2. Future research with identifiable data</legend>
          <label className={answers.futureData === "yes" ? "on" : ""}>
            <input
              type="radio"
              name="futureData"
              checked={answers.futureData === "yes"}
              onChange={() => setField("futureData", "yes")}
            />
            YES — store my identifiable data for future research, only with IRB
            or local ethics approval.
          </label>
          <label className={answers.futureData === "no" ? "on" : ""}>
            <input
              type="radio"
              name="futureData"
              checked={answers.futureData === "no"}
              onChange={() => setField("futureData", "no")}
            />
            NO — do not donate my identifiable data for future research.
          </label>
        </fieldset>

        {answers.futureData === "yes" ? (
          <fieldset className="consent-block">
            <legend>3. If yes, how may it be used?</legend>
            <label className={answers.futureDataScope === "unrestricted" ? "on" : ""}>
              <input
                type="radio"
                name="futureDataScope"
                checked={answers.futureDataScope === "unrestricted"}
                onChange={() => setField("futureDataScope", "unrestricted")}
              />
              There are no restrictions on the kind of research that may be
              done with my data.
            </label>
            <label className={answers.futureDataScope === "nala" ? "on" : ""}>
              <input
                type="radio"
                name="futureDataScope"
                checked={answers.futureDataScope === "nala"}
                onChange={() => setField("futureDataScope", "nala")}
              />
              Only research related to Project NALA / NTU Education
              Transformation.
            </label>
          </fieldset>
        ) : null}

        <fieldset className="consent-block">
          <legend>4. Contact for future studies</legend>
          <label className={answers.futureContact === "yes" ? "on" : ""}>
            <input
              type="radio"
              name="futureContact"
              checked={answers.futureContact === "yes"}
              onChange={() => setField("futureContact", "yes")}
            />
            YES — you may contact me about future research I may be eligible
            for.
          </label>
          <label className={answers.futureContact === "no" ? "on" : ""}>
            <input
              type="radio"
              name="futureContact"
              checked={answers.futureContact === "no"}
              onChange={() => setField("futureContact", "no")}
            />
            NO — do not contact me for future research.
          </label>
        </fieldset>

        {answers.futureContact === "yes" ? (
          <fieldset className="consent-block">
            <legend>5. Contact method</legend>
            <label className={answers.contactEmail ? "on" : ""}>
              <input
                type="checkbox"
                checked={answers.contactEmail}
                onChange={(event) =>
                  setField("contactEmail", event.target.checked)
                }
              />
              I agree to be contacted via email.
            </label>
          </fieldset>
        ) : null}

        {error ? <p className="consent-error">{error}</p> : null}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </div>
  );
}
