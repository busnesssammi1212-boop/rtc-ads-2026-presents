"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/components/useSession";

export default function Admin() {
  const session = useSession();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` });

  async function load() {
    const res = await fetch("/api/admin/withdrawals", { headers: headers() });
    const j = await res.json();
    if (!res.ok) return setError("আপনি admin নন");
    setRows(j.rows);
  }
  useEffect(() => { if (session) load(); }, [session]);

  async function act(id, status) {
    const note = status === "rejected" ? prompt("বাতিলের কারণ?") || "" : "";
    const res = await fetch("/api/admin/withdrawals", { method: "POST", headers: headers(), body: JSON.stringify({ id, status, note }) });
    if (!res.ok) alert((await res.json()).error);
    load();
  }

  if (!session) return <main className="wrap"><p>লোড হচ্ছে…</p></main>;
  if (error) return <main className="wrap"><p className="err">{error}</p></main>;

  return (
    <main className="wrap">
      <section className="card">
        <h3>Withdraw অনুরোধ</h3>
        <p className="microcopy" style={{ textAlign: "left" }}>প্রথমে bKash/Nagad অ্যাপ থেকে টাকা পাঠান, তারপর "Paid" চাপুন।</p>
        <table>
          <thead><tr><th>User</th><th>৳</th><th>নম্বর</th><th>অবস্থা</th><th></th></tr></thead>
          <tbody>{rows.map((w) => (
            <tr key={w.id}>
              <td>{w.profiles?.email}</td><td>{w.amount}</td><td>{w.method} {w.account_no}</td><td>{w.status}</td>
              <td className="row">
                {w.status === "pending" && <>
                  <button className="btn btn-primary btn-sm" onClick={() => act(w.id, "paid")}>Paid</button>
                  <button className="btn btn-danger btn-sm" onClick={() => act(w.id, "rejected")}>Reject</button>
                </>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
