import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Academy Hub — Football Academy Dashboard",
  description: "Coach your squad with 4-option check-ins and player statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${barlow.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
