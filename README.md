# Technex Ads — Next.js + Supabase + AdGem

Offerwall-ভিত্তিক earning site। AdGem যে টাকা দেয় তার ৩০% user পায়।

## ১. Supabase
1. supabase.com-এ নতুন project খুলুন।
2. SQL Editor → `supabase/schema.sql` পুরোটা paste করে Run।
3. Authentication → Providers → Email চালু রাখুন (শুরুতে "Confirm email" বন্ধ রাখলে টেস্ট সহজ)।
4. Project Settings → API থেকে `URL`, `anon key`, `service_role key` কপি করুন।
5. নিজে signup করার পর SQL Editor-এ: `update public.profiles set is_admin = true where email = 'আপনার@email';`

## ২. AdGem
1. adgem.com-এ publisher হিসেবে sign up করে একটা App/Placement বানান, `App ID` নিন।
2. Postback URL সেট করুন (macro নাম AdGem dashboard/docs দেখে মিলিয়ে নিন):
   `https://YOUR-APP.vercel.app/api/adgem/postback?key=ADGEM_POSTBACK_KEY&player_id={player_id}&transaction_id={transaction_id}&payout_usd={payout_usd}&offer_name={offer_name}`
3. AdGem-এর test tool দিয়ে একটা test postback পাঠিয়ে দেখুন Supabase-এ `wallet_transactions`-এ row আসছে কি না।
4. AdGem-এর Terms পড়ে নিন: দেশ, বয়স ও traffic-এর শর্ত আছে কি না। approve না হওয়া পর্যন্ত live করবেন না।

## ৩. Vercel
1. এই ফোল্ডার GitHub-এ push করুন (`.env.local` push করবেন না)।
2. vercel.com → Add New Project → repo import।
3. Settings → Environment Variables-এ `.env.example`-এর সব key বসান।
4. Deploy। Vercel যে URL দেবে সেটা AdGem postback-এ বসান।

## লোকালি চালাতে
```
cp .env.example .env.local   # মান বসান
npm install
npm run dev
```

## Production-এর আগে বাকি কাজ
- `USD_TO_BDT` rate সঠিক রাখুন; AdGem payout কত দিনে আসে (net 30 ইত্যাদি) দেখে withdraw-এ hold period যোগ করুন।
- phone OTP, একজনের একটাই account, VPN/multi-account ধরা।
- Terms, Privacy Policy, আয়ের উপর কর/লাইসেন্স (আইনজীবী/অ্যাকাউন্ট্যান্টের সাথে কথা বলুন)।
- AdGem approval না পেলে বা reversal বেশি হলে ব্যালেন্স ঋণাত্মক ঝুঁকি: reversal-এ ব্যালেন্স ০-র নিচে নামে না, তাই তোলা টাকা ফেরত আসে না। তাই hold period জরুরি।
