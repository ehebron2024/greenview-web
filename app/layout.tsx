import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ position: "relative" }}
      >
        <img
          src="./print_transparent.svg"
          alt="GreenView Logo"
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            width: "120px",
            height: "120px",
          }}
        />
        {children}
      </body>
    </html>
  );
}
