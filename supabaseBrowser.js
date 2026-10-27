import { createClient } from "@supabase/supabase-js";

// Lazy: build/prerender-এর সময় env না থাকলেও crash করবে না।
let _client;
function client() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing"
    );
  }
  return _client;
}
export const supabase = new Proxy({}, {
  get(_t, prop) {
    const c = client();
    const v = c[prop];
    return typeof v === "function" ? v.bind(c) : v;
  },
});
