import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeeWe",
  description: "서울 공공데이터 기반 실시간 주변 인구 추정치와 교통 상황 대시보드.",
  icons: {
    icon: [{ url: "/seewe-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "SeeWe",
    description: "서울 공공데이터 기반 실시간 주변 인구 추정치와 교통 상황 대시보드.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "SeeWe" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
