import { useState } from "react";
import {
  finishFirstPassword,
  login,
  MIN_PASSWORD_LENGTH,
  passwordError,
} from "../state/auth";
import ThemeSwitch from "../components/ThemeSwitch";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = await login(username, password);
      if (!session) {
        setError("Email, matriculation number, or password is incorrect.");
        return;
      }
      if (session.mustSetPassword) {
        setPending({
          email: session.username,
          matric: String(password).trim(),
        });
        setNextPassword("");
        setConfirm("");
        return;
      }
      onLogin(session);
    } catch (err) {
      setError(err.message || "Could not connect to the login service.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    const reason = passwordError(nextPassword, confirm, pending?.matric);
    if (reason) {
      setError(reason);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const session = await finishFirstPassword(
        pending.email,
        pending.matric,
        nextPassword
      );
      if (!session) {
        setError("Could not save that password. Try logging in again.");
        return;
      }
      onLogin(session);
    } catch (err) {
      setError(err.message || "Could not save that password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page login-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Circuit analysis</p>
          <h1>Circuito</h1>
        </div>
        <ThemeSwitch />
      </header>
      {pending ? (
        <form className="login-card" onSubmit={savePassword}>
          <h2>Choose a password</h2>
          <p className="login-hint">
            First login for {pending.email}. Pick a password of at least{" "}
            {MIN_PASSWORD_LENGTH} characters. Next time, log in with this
            password instead of your matriculation number.
          </p>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={busy}
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save password"}
          </button>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => {
              setPending(null);
              setError("");
            }}
          >
            Back
          </button>
        </form>
      ) : (
        <form className="login-card" onSubmit={submit}>
          <h2>Log in</h2>
          <p className="login-hint">
            First time: NTU email and matriculation number. After that: the
            same email and the password you chose.
          </p>
          <label>
            Email
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            Matriculation number or password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Checking…" : "Log in"}
          </button>
        </form>
      )}
    </div>
  );
}
