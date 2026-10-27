"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";

// login না থাকলে /login-এ পাঠায়
export function useSession() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) location.href = "/login";
      else setSession(data.session);
    });
  }, []);
  return session;
}
