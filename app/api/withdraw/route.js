import { admin, getUserFromRequest } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: "login করুন" }, { status: 401 });

  const { amount, method, account } = await req.json();
  const amt = Number(amount);
  const acc = String(account || "").trim();
  if (!["bkash", "nagad", "rocket"].includes(method) || !/^01\d{9}$/.test(acc) || !(amt > 0)) {
    return Response.json({ error: "তথ্য ঠিক নেই (নম্বর 01XXXXXXXXX হতে হবে)" }, { status: 400 });
  }

  const { data, error } = await admin.rpc("request_withdraw", {
    p_user: user.id,
    p_amount: amt,
    p_method: method,
    p_account: acc,
    p_min: Number(process.env.MIN_WITHDRAW_BDT ?? 200),
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ id: data });
}
