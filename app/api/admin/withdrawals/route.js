import { admin, getUserFromRequest } from "@/lib/supabaseAdmin";

<<<<<<< HEAD
export const dynamic = "force-dynamic";

=======
>>>>>>> 9cfbcb7a987694c9cb12734e3b71c223be00bcdb
async function requireAdmin(req) {
  const user = await getUserFromRequest(req);
  if (!user) return null;
  const { data } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ? user : null;
}

export async function GET(req) {
  if (!(await requireAdmin(req))) return Response.json({ error: "forbidden" }, { status: 403 });
  const { data } = await admin
    .from("withdrawals")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(100);
  return Response.json({ rows: data || [] });
}

export async function POST(req) {
  if (!(await requireAdmin(req))) return Response.json({ error: "forbidden" }, { status: 403 });
  const { id, status, note } = await req.json();
  if (!["paid", "rejected"].includes(status)) return Response.json({ error: "bad status" }, { status: 400 });
  const { error } = await admin.rpc("process_withdraw", { p_id: id, p_status: status, p_note: note || null });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
