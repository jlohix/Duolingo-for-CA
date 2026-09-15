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

export function consentError(answers) {
  if (answers.study !== "yes" && answers.study !== "no") {
    return "Choose whether you will take part in the study.";
  }
  if (answers.futureData !== "yes" && answers.futureData !== "no") {
    return "Choose whether your identifiable data may be stored for future research.";
  }
  if (
    answers.futureData === "yes" &&
    answers.futureDataScope !== "unrestricted" &&
    answers.futureDataScope !== "nala"
  ) {
    return "If you agree to future research, choose how your data may be used.";
  }
  if (answers.futureContact !== "yes" && answers.futureContact !== "no") {
    return "Choose whether we may contact you about future research.";
  }
  if (answers.futureContact === "yes" && !answers.contactEmail) {
    return "If we may contact you, please agree to email contact.";
  }
  return "";
}
