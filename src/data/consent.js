export const CONSENT_FORM_VERSION = "leads-2026-09";

export const CONSENT_FORM_HREF = "/consent/study-information.html";

export function emptyConsentAnswers() {
  return {
    study: "",
    futureData: "",
    futureDataScope: "",
    futureContact: "",
    contactEmail: false,
    formVersion: CONSENT_FORM_VERSION,
  };
}

// Whether the student may continue into the app. This drives the enabled
// state of the "Save and continue" button. Requirements:
//   - Section 1 (take part in study): must be "yes"
//   - Section 2 (future-data use): must be "yes", and a scope must be chosen
//   - Section 4 (contact for future studies): must be answered (yes OR no),
//     and if "yes", email contact must be agreed to. Choosing "no" is fine.
// Selecting "no" on section 1 or 2 leaves the button disabled (blacked out).
export function canSubmitConsent(answers) {
  return consentError(answers) === "";
}

export function consentError(answers) {
  // 1. Taking part in the study is REQUIRED. Students who decline cannot
  //    enter the app.
  if (answers.study !== "yes" && answers.study !== "no") {
    return "Choose whether you will take part in the study.";
  }
  if (answers.study === "no") {
    return "You must agree to take part in the study to use Circuito.";
  }

  // 2. Storing identifiable data for future research is REQUIRED.
  if (answers.futureData !== "yes" && answers.futureData !== "no") {
    return "Choose whether your identifiable data may be stored for future research.";
  }
  if (answers.futureData === "no") {
    return "You must agree to future research use of your data to use Circuito.";
  }

  // 3. If (always) yes to future data, a usage scope must be chosen.
  if (
    answers.futureDataScope !== "unrestricted" &&
    answers.futureDataScope !== "nala"
  ) {
    return "Choose how your data may be used for future research.";
  }

  // 4. Contact for future studies is OPTIONAL — students may opt out here
  //    (choosing "no" is allowed and still lets them into the app).
  if (answers.futureContact !== "yes" && answers.futureContact !== "no") {
    return "Choose whether we may contact you about future research.";
  }
  if (answers.futureContact === "yes" && !answers.contactEmail) {
    return "If we may contact you, please agree to email contact.";
  }
  return "";
}
