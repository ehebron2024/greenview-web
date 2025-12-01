"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// Import your configured Firebase app instance
import { getAuth } from "firebase/auth";
import { db, app } from "@/lib/firebase";

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const firstName = namePart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export default function UserPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserEmail() {
      if (!userId) return;
      const db = getFirestore(app);
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setEmail(userSnap.data().email || null);
      }
    }
    fetchUserEmail();
  }, [userId]);

  const firstName = getFirstNameFromEmail(email);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5dc",
        color: "#013220",
      }}
    >
      <h1>{email ? `Welcome, ${firstName}!` : "Loading..."}</h1>
      {/* You can add more personalized content here */}
    </div>
  );
}
