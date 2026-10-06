"use client";
import { startTransition, useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form className="a-stack" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
      <label className="a-field"><span>E-mail</span><input name="email" type="email" autoComplete="username" required autoFocus /></label>
      <label className="a-field"><span>Heslo</span><input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <button className="a-btn a-btn--primary a-btn--block" disabled={pending}>{pending ? "Přihlašuji…" : "Přihlásit se"}</button>
      {state && !state.ok && <p role="alert" className="a-msg a-msg--err" id="login-error">{state.message}</p>}
    </form>
  );
}
