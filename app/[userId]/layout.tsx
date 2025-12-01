import React from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  const resolvedParams = await params;
  return (
    <div>
      <header
        style={{
          padding: "20px",
          background: "#2e7d32",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
          User Area for: {resolvedParams.userId}
        </h2>
      </header>
      <main>{children}</main>
    </div>
  );
}
