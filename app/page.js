import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Offer সম্পন্ন করুন।<br /><span>পুরস্কার পান।</span></h1>
        <p className="hero-copy">
          অ্যাপ ইনস্টল, সার্ভে বা ছোট টাস্ক সম্পন্ন করলে বিজ্ঞাপনদাতার দেওয়া অর্থের ৩০% আপনার ওয়ালেটে জমা হয়।
          জমানো টাকা bKash, Nagad বা Rocket-এ তুলুন।
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/login">শুরু করুন</Link>
          <Link className="btn btn-quiet" href="/offers">Offer দেখুন</Link>
        </div>
      </section>
    </main>
  );
}
