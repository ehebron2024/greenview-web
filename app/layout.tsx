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
        style={{ position: "relative", paddingTop: "100px" }}
      >
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            zIndex: 1000,
            backgroundColor: "#f5f5dc",
            padding: "12px 20px",
            borderBottom: "3px solid #2e7d32",
            textAlign: "center",
          }}
        >
          <img
            src="/print_transparent.svg"
            alt="GreenView Logo"
            style={{
              width: "70px",
              height: "70px",
              marginBottom: "5px",
            }}
          />
          <h1
            style={{
              margin: "0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#013220",
              letterSpacing: "1px",
              fontFamily: "'Poppins', sans-serif",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            Greenview Renovation
          </h1>
        </div>
        {children}
      </body>
    </html>
  );
}
