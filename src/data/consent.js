export const CONSENT_FORM_VERSION = "leads-2026-09";

export const CONSENT_FORM_HREF = "/consent/study-information.html";

export function emptyConsentAnswers() {
  return {
    // Sections 1 & 2 are required to use the app and only offer "yes", so we
    // pre-select "yes" — the student confirms rather than choosing.
    study: "yes",
    futureData: "yes",
    futureDataScope: "",
    // Section 4 (contact for future studies) is optional: the student must
    // actively choose yes or no.
    futureContact: "",
    contactEmail: false,
    formVersion: CONSENT_FORM_VERSION,
  };
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
