import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import NavigationBar from "@/components/NavigationBar";

export const metadata: Metadata = {
  title: "Greenview Renovation",
  description: "Transform your home with Greenview Renovation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ margin: "0", padding: "0" }}>
        <UserProvider>
          <div style={{ minHeight: "100vh" }}>
            <NavigationBar />
            <main style={{ padding: "20px" }}>{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
