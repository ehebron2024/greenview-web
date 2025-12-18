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
      <body className="bg-card text-foreground">
        <UserProvider>
          <div className="min-h-screen">
            <NavigationBar />
            <main className="p-5">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
