import { useState } from "react";
import {
  finishFirstPassword,
  finishForgotPassword,
  login,
  MIN_PASSWORD_LENGTH,
  passwordError,
  verifyForgotMatric,
} from "../state/auth";
import ThemeSwitch from "../components/ThemeSwitch";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [forgot, setForgot] = useState(null);
  const [matric, setMatric] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function backToLogin() {
    setMode("login");
    setPending(null);
    setForgot(null);
    setMatric("");
    setNextPassword("");
    setConfirm("");
    setError("");
  }

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
        setMode("first-password");
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

  async function verifyForgot(event) {
    event.preventDefault();
    const email = String(username || "").trim().toLowerCase();
    const secret = String(matric || "").trim();
    if (!email.endsWith("@e.ntu.edu.sg")) {
      setError("Use your NTU email ending in @e.ntu.edu.sg.");
      return;
    }
    if (!secret) {
      setError("Enter your matriculation number.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const ok = await verifyForgotMatric(email, secret);
      if (!ok) {
        setError("Email or matriculation number is incorrect.");
        return;
      }
      setForgot({ email, matric: secret });
      setMode("forgot-reset");
      setNextPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Could not verify that account.");
    } finally {
      setBusy(false);
    }
  }

  async function saveForgotPassword(event) {
    event.preventDefault();
    const reason = passwordError(nextPassword, confirm, forgot?.matric);
    if (reason) {
      setError(reason);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const session = await finishForgotPassword(
        forgot.email,
        forgot.matric,
        nextPassword
      );
      if (!session) {
        setError("Could not reset that password. Check your details and try again.");
        return;
      }
      onLogin(session);
    } catch (err) {
      setError(err.message || "Could not reset that password.");
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

      {mode === "first-password" && pending ? (
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
            onClick={backToLogin}
          >
            Back
          </button>
        </form>
      ) : null}

      {mode === "forgot-verify" ? (
        <form className="login-card" onSubmit={verifyForgot}>
          <h2>Forgot password</h2>
          <p className="login-hint">
            Enter your NTU email and matriculation number so we can verify it is
            you. Then you can choose a new password.
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
            Matriculation number
            <input
              type="password"
              autoComplete="off"
              value={matric}
              onChange={(e) => setMatric(e.target.value)}
              disabled={busy}
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Checking…" : "Verify"}
          </button>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={backToLogin}
          >
            Back to log in
          </button>
        </form>
      ) : null}

      {mode === "forgot-reset" && forgot ? (
        <form className="login-card" onSubmit={saveForgotPassword}>
          <h2>Choose a new password</h2>
          <p className="login-hint">
            Verified {forgot.email}. Pick a new password of at least{" "}
            {MIN_PASSWORD_LENGTH} characters. Do not reuse your matriculation
            number.
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
            {busy ? "Saving…" : "Save new password"}
          </button>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => {
              setMode("forgot-verify");
              setForgot(null);
              setNextPassword("");
              setConfirm("");
              setError("");
            }}
          >
            Back
          </button>
        </form>
      ) : null}

      {mode === "login" ? (
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
          <button
            type="button"
            className="ghost login-forgot"
            disabled={busy}
            onClick={() => {
              setMode("forgot-verify");
              setError("");
              setMatric("");
            }}
          >
            Forgot password?
          </button>
        </form>
      ) : null}
    </div>
  );
}
