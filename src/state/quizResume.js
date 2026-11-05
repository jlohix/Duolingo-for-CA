import { useEffect, useRef } from "react";
import { getProgressOwner } from "./progress";
import { loadSession } from "./auth";

const PREFIX = "circuito-quiz-resume-v1";

function ownerKey() {
  return (
    getProgressOwner() ||
    String(loadSession()?.username || "")
      .trim()
      .toLowerCase() ||
    "anon"
  );
}

function storageKey(runKey) {
  return `${PREFIX}:${ownerKey()}:${String(runKey || "")}`;
}

function asSetList(value) {
  return Array.isArray(value) ? value : [];
}

export function loadQuizResume(runKey) {
  if (!runKey || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(runKey));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || !Array.isArray(data.queue) || !data.queue.length) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveQuizResume(runKey, snapshot) {
  if (!runKey || !snapshot?.queue?.length || typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      storageKey(runKey),
      JSON.stringify({ v: 1, savedAt: Date.now(), ...snapshot })
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearQuizResume(runKey) {
  if (!runKey || typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(runKey));
  } catch {
    /* ignore */
  }
}

export function resumeSets(resume) {
  return {
    solvedIds: new Set(asSetList(resume?.solvedIds)),
    attemptedIds: new Set(asSetList(resume?.attemptedIds)),
    completedFamilies: new Set(asSetList(resume?.completedFamilies)),
    firstPassIds: new Set(asSetList(resume?.firstPassIds)),
  };
}

/** Keep writing the current quiz so a Close or a tab close can pick it up later. */
export function usePersistQuiz(runKey, getPayload, stoppedRef) {
  const payloadRef = useRef(getPayload);
  payloadRef.current = getPayload;

  useEffect(() => {
    if (!runKey || stoppedRef?.current) return;
    const payload = payloadRef.current?.();
    if (!payload?.queue?.length) return;
    saveQuizResume(runKey, payload);
  });

  useEffect(() => {
    if (!runKey) return undefined;
    const flush = () => {
      if (stoppedRef?.current) return;
      const payload = payloadRef.current?.();
      if (!payload?.queue?.length) return;
      saveQuizResume(runKey, payload);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [runKey, stoppedRef]);
}
