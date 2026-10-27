import { admin } from "@/lib/supabaseAdmin";

// AdGem dashboard-এ Postback URL এভাবে বসান (macro নাম AdGem docs থেকে মিলিয়ে নিন):
// https://YOUR-APP.vercel.app/api/adgem/postback?key=ADGEM_POSTBACK_KEY
//   &player_id={player_id}&transaction_id={transaction_id}&payout_usd={payout_usd}
//   &amount={amount}&offer_id={offer_id}&offer_name={offer_name}

export const dynamic = "force-dynamic";

export async function GET(req) {
  const q = new URL(req.url).searchParams;

  if (q.get("key") !== process.env.ADGEM_POSTBACK_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const playerId = q.get("player_id");
  const txId = q.get("transaction_id");
  const payoutUsd = Number(q.get("payout_usd") ?? q.get("payout") ?? 0);
  const reversed = ["1", "true", "reversed", "chargeback"].includes(
    String(q.get("reversal") ?? q.get("state") ?? "").toLowerCase()
  );

  if (!playerId || !txId || !(payoutUsd >= 0)) {
    return new Response("bad request", { status: 400 });
  }

  const share = Number(process.env.USER_SHARE ?? 0.3);
  const rate = Number(process.env.USD_TO_BDT ?? 120);
  const rewardBdt = Number((payoutUsd * rate * share).toFixed(4));

  // কাঁচা event সংরক্ষণ (audit)
  await admin.from("adgem_events").upsert(
    { transaction_id: txId, player_id: playerId, payout_usd: payoutUsd, raw: Object.fromEntries(q) },
    { onConflict: "transaction_id", ignoreDuplicates: true }
  );

  const fn = reversed ? "reverse_adgem" : "credit_adgem";
  const { error } = await admin.rpc(fn, {
    p_user: playerId,
    p_tx: txId,
    p_amount: rewardBdt,
    p_meta: { payout_usd: payoutUsd, offer: q.get("offer_name") },
  });

  if (error) {
    console.error("postback error", error);
    return new Response("user not found or db error", { status: 400 });
  }
  // duplicate হলেও 200 দিই, যাতে AdGem বারবার retry না করে
  return new Response("OK", { status: 200 });
}
