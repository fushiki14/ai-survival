import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AI生存診断 | あなたのキャリア、AI時代に生き残れるか",
  description:
    "OpenAI・野村総研・WEF・PwCの研究データに基づき、あなたの職種とスキルをAIが5軸で容赦なく診断。生存率と具体的な生存戦略を即時提供。無料プレビューあり。",
  openGraph: {
    title: "AI生存診断",
    description:
      "あなたのキャリア、AI時代に生き残れるか。5軸スコア分析と生存戦略を即時提供。",
    siteName: "AI生存診断",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI生存診断",
    description:
      "あなたのキャリア、AI時代に生き残れるか。5軸スコア分析と生存戦略を即時提供。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
