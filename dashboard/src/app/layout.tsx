import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "News Research Dashboard — Vaishali Gauba Media",
  description: "Media research dashboard for VGM keyword tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
