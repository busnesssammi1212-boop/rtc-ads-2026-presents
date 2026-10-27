// শুধু server-এ (API route)। RLS bypass করে, তাই browser-এ কখনো import করবেন না।
import { createClient } from "@supabase/supabase-js";
<<<<<<< HEAD

// Lazy: build-এর সময় env না থাকলেও crash করবে না, প্রথম ব্যবহারে client বানাবে।
let _client;
function client() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env variables missing on server");
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
export const admin = new Proxy({}, {
  get(_t, prop) {
    const c = client();
    const v = c[prop];
    return typeof v === "function" ? v.bind(c) : v;
  },
});
=======
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
>>>>>>> 9cfbcb7a987694c9cb12734e3b71c223be00bcdb

export async function getUserFromRequest(req) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}
