"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import { useSession } from "@/components/useSession";

const bdt = (n) => "৳" + Number(n || 0).toFixed(2);
const KIND = { adgem_reward: "Offer পুরস্কার", adgem_reversal: "Offer বাতিল", withdraw: "উত্তোলন", withdraw_refund: "উত্তোলন ফেরত" };

export default function Dashboard() {
  const session = useSession();
  const [profile, setProfile] = useState(null);
  const [txs, setTxs] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("*").single().then(({ data }) => {
      setProfile(data);
      setIsAdmin(!!data?.is_admin);
    });
    supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setTxs(data || []));
  }, [session]);

  if (!session || !profile) return <main className="wrap"><p>লোড হচ্ছে…</p></main>;

  return (
    <main className="wrap">
      <div className="stats">
        <article className="stat-card"><p>বর্তমান ব্যালেন্স</p><strong>{bdt(profile.balance)}</strong></article>
        <article className="stat-card"><p>মোট আয়</p><strong>{bdt(profile.total_earned)}</strong></article>
        <article className="stat-card"><p>অ্যাকাউন্ট</p><strong style={{ fontSize: 14 }}>{profile.email}</strong></article>
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        <Link className="btn btn-primary" href="/offers">Offer করুন</Link>
        <Link className="btn btn-quiet" href="/withdraw">টাকা তুলুন</Link>
        {isAdmin && <Link className="btn btn-outline" href="/admin">Admin</Link>}
      </div>
      <section className="card">
        <h3>সাম্প্রতিক লেনদেন</h3>
        {txs.length === 0 ? <p className="microcopy">এখনো কোনো লেনদেন নেই। প্রথম offer সম্পন্ন করুন।</p> : (
          <table>
            <thead><tr><th>ধরন</th><th>পরিমাণ</th><th>সময়</th></tr></thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id}>
                  <td>{KIND[t.kind] || t.kind}</td>
                  <td style={{ color: t.amount >= 0 ? "var(--green)" : "#ff9aa8" }}>{t.amount >= 0 ? "+" : ""}{bdt(t.amount)}</td>
                  <td>{new Date(t.created_at).toLocaleString("bn-BD")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
