"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: "", text: "" });
    const fn = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await fn.call(supabase.auth, { email, password });
    setBusy(false);
    if (error) return setMsg({ type: "err", text: error.message });
    if (mode === "signup" && !data.session) {
      return setMsg({ type: "ok", text: "ইমেইলে পাঠানো লিংকে ক্লিক করে অ্যাকাউন্ট নিশ্চিত করুন।" });
    }
    location.href = "/dashboard";
  }

  return (
    <main className="narrow">
      <form className="card" onSubmit={submit}>
        <h2>{mode === "login" ? "Sign in" : "অ্যাকাউন্ট খুলুন"}</h2>
        <label htmlFor="e">ইমেইল</label>
        <input id="e" className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="p">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
        <input id="p" className="field" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg.text && <p className={msg.type === "err" ? "err" : "okmsg"}>{msg.text}</p>}
        <button className="btn btn-primary full" disabled={busy}>{busy ? "অপেক্ষা করুন…" : mode === "login" ? "Sign in" : "Sign up"}</button>
        <p className="microcopy">
          <button type="button" className="text-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "নতুন? অ্যাকাউন্ট খুলুন" : "আগে থেকে অ্যাকাউন্ট আছে? Sign in"}
          </button>
        </p>
      </form>
    </main>
  );
}
