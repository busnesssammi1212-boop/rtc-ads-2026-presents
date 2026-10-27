"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

export default function Nav() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-icon">T</span>
        <span>TECHNEX <b>ADS</b></span>
      </Link>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/offers">Offers</Link>
        <Link href="/withdraw">Withdraw</Link>
      </nav>
      {user ? (
        <button className="btn btn-outline" onClick={() => supabase.auth.signOut().then(() => (location.href = "/"))}>
          Sign out
        </button>
      ) : (
        <Link className="btn btn-outline" href="/login">Sign in</Link>
      )}
    </header>
  );
}
