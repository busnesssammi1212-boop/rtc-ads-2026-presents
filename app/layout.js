import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = { title: "Technex Ads", description: "Offer সম্পন্ন করুন, পুরস্কার পান" };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
