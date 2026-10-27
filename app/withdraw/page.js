"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import { useSession } from "@/components/useSession";

export default function Withdraw() {
  const session = useSession();
  const [balance, setBalance] = useState(0);
  const [list, setList] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [account, setAccount] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const min = 200;

  async function load() {
    const p = await supabase.from("profiles").select("balance").single();
    setBalance(p.data?.balance || 0);
    const w = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
    setList(w.data || []);
  }
  useEffect(() => { if (session) load(); }, [session]);

  async function submit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ amount, method, account }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg({ type: "err", text: j.error });
    setMsg({ type: "ok", text: "অনুরোধ জমা হয়েছে। অ্যাডমিন যাচাই করে পাঠাবেন।" });
    setAmount("");
    load();
  }

  if (!session) return <main className="wrap"><p>লোড হচ্ছে…</p></main>;

  return (
    <main className="wrap">
      <form className="card" onSubmit={submit}>
        <h3>টাকা তুলুন</h3>
        <p className="microcopy" style={{ textAlign: "left" }}>ব্যালেন্স ৳{Number(balance).toFixed(2)} · সর্বনিম্ন ৳{min}</p>
        <label htmlFor="a">পরিমাণ (৳)</label>
        <input id="a" className="field" type="number" min={min} step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        <label htmlFor="m">মাধ্যম</label>
        <select id="m" className="field" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option>
        </select>
        <label htmlFor="n">মোবাইল নম্বর</label>
        <input id="n" className="field" inputMode="numeric" placeholder="01XXXXXXXXX" required value={account} onChange={(e) => setAccount(e.target.value)} />
        {msg.text && <p className={msg.type === "err" ? "err" : "okmsg"}>{msg.text}</p>}
        <button className="btn btn-primary full">অনুরোধ পাঠান</button>
      </form>
      <section className="card">
        <h3>আপনার অনুরোধ</h3>
        {list.length === 0 ? <p className="microcopy">এখনো কোনো অনুরোধ নেই।</p> : (
          <table>
            <thead><tr><th>পরিমাণ</th><th>মাধ্যম</th><th>অবস্থা</th><th>তারিখ</th></tr></thead>
            <tbody>{list.map((w) => (
              <tr key={w.id}><td>৳{w.amount}</td><td>{w.method} {w.account_no}</td>
                <td>{{ pending: "অপেক্ষমাণ", paid: "পরিশোধিত", rejected: "বাতিল" }[w.status]}</td>
                <td>{new Date(w.created_at).toLocaleDateString("bn-BD")}</td></tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </main>
  );
}
