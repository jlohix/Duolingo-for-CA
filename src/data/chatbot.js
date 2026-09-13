// Controls who can see the "Ask the tutor" chatbot.
//
// This is the one-line launch switch:
//   "ee22"  -> only class EE22 (test accounts + admins). Use this while testing.
//   "all"   -> every logged-in student (roll it out to the whole cohort).
//   "off"   -> hide the chatbot for everyone.
//
// EE22 is chosen for the test phase because our test accounts and admins are
// already assigned to it, so no extra setup is needed to gate the rollout.
export const CHATBOT_AUDIENCE = "ee22";

// The class the "ee22" audience unlocks. Kept as a constant so the gated
// class is easy to change without hunting through the logic below.
export const CHATBOT_TEST_CLASS = "EE22";

// Decide whether the current user should see the chatbot.
//   classId  -> the student's assigned class (e.g. progress.classId)
//   isAdmin  -> whether the current session is a staff/admin account
export function canUseChatbot({ classId, isAdmin = false } = {}) {
  switch (CHATBOT_AUDIENCE) {
    case "off":
      return false;
    case "all":
      return true;
    case "ee22":
    default: {
      const id = String(classId || "").trim().toUpperCase();
      return id === CHATBOT_TEST_CLASS || Boolean(isAdmin);
    }
  }
}
