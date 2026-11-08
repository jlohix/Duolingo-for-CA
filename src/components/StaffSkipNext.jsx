import { isAdmin, loadSession } from "../state/auth";

/** Staff-only skip. Renders nothing for students, even if a caller forgets `preview`. */
export default function StaffSkipNext({ onClick, className = "" }) {
  if (!isAdmin(loadSession())) return null;
  return (
    <button
      type="button"
      className={`ghost staff-next ${className}`.trim()}
      onClick={onClick}
      aria-label="Skip this part without answering"
    >
      Skip
    </button>
  );
}
