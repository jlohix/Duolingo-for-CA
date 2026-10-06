// Controls who can see the "Ask the tutor" chatbot.
//
// This is the one-line launch switch:
//   "ee22"  -> only class EE22 (test accounts + admins). Use this while testing.
//   "all"   -> every logged-in student (roll it out to the whole cohort).
//   "off"   -> hide the chatbot for everyone.
//
// EE22 is chosen for the test phase because our test accounts and admins are
// already assigned to it, so no extra setup is needed to gate the rollout.
export const CHATBOT_AUDIENCE = "all";

// The class the "ee22" audience unlocks. Kept as a constant so the gated
// class is easy to change without hunting through the logic below.
export const CHATBOT_TEST_CLASS = "EE22";

// Screens where the tutor is deliberately HIDDEN, even for eligible users.
// The Skip Quiz is a test-out gate that unlocks a topic based on what the
// student already knows, so a tutor there would undermine its purpose.
// All other screens (lessons, papers, labs, home, boards) show the tutor.
//   - "skip" -> Skip Quiz (test-out gate that unlocks a topic)
export const CHATBOT_HIDDEN_SCREENS = new Set(["skip"]);

// Whether the current screen is one where the tutor should stay hidden.
export function isChatbotHiddenScreen(screen) {
  return CHATBOT_HIDDEN_SCREENS.has(String(screen || ""));
}

// Decide whether the current user should see the chatbot right now.
//   classId  -> the student's assigned class (e.g. progress.classId)
//   isAdmin  -> whether the current session is a staff/admin account
//   screen   -> the active screen id (so we can hide it on assessment gates)
export function canUseChatbot({ classId, isAdmin = false, screen } = {}) {
  // Never show on assessment screens, regardless of audience.
  if (isChatbotHiddenScreen(screen)) return false;

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
