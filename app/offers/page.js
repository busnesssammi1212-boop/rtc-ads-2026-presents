"use client";
import { useSession } from "@/components/useSession";

export default function Offers() {
  const session = useSession();
  if (!session) return <main className="wrap"><p>লোড হচ্ছে…</p></main>;

  // player_id = Supabase user id। AdGem postback-এ এটাই ফেরত আসে, তাই টাকা সঠিক user পায়।
  const appId = process.env.NEXT_PUBLIC_ADGEM_APP_ID;
  const src = `https://api.adgem.com/v1/wall?appid=${encodeURIComponent(appId)}&playerid=${encodeURIComponent(session.user.id)}`;

  return (
    <main className="wrap">
      <p className="microcopy" style={{ textAlign: "left" }}>
        Offer সম্পন্ন হলে AdGem আমাদের জানায়, তারপর আপনার ব্যালেন্সে টাকা যোগ হয়। কয়েক মিনিট লাগতে পারে।
      </p>
      <iframe className="offerwall" src={src} title="Offers" />
    </main>
  );
}
