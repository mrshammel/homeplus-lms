import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Home Plus Online Learning — Learn. Grow. Succeed.",
  description:
    "A flexible, asynchronous home learning program for Alberta students in grades 1–9. Structured curriculum, teacher support, and self-paced lessons that fit family life.",
  keywords: ["Home Plus", "LMS", "Alberta curriculum", "online learning", "asynchronous learning", "PRPS", "home education"],
  openGraph: {
    title: "Home Plus Online Learning — Learn. Grow. Succeed.",
    description: "A flexible, asynchronous home learning program for Alberta students in grades 1–9. Structured curriculum, teacher support, and self-paced lessons that fit family life.",
    images: [{ url: "/images/hpln-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Plus Online Learning — Learn. Grow. Succeed.",
    description: "A flexible, asynchronous home learning program for Alberta students in grades 1–9. Structured curriculum, teacher support, and self-paced lessons that fit family life.",
    images: ["/images/hpln-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
