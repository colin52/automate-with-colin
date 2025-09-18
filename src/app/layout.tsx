import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Automate with Colin",
  description: "Consulting, education, and real automation solutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        {/* dedicated scroll container for snap */}
        <div className="h-screen overflow-y-auto snap-y snap-mandatory overscroll-y-contain">
          {children}
        </div>
      </body>
    </html>
  );
}
