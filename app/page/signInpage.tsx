"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/firebase"; // Adjust import if your firebase config is elsewhere

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const firstName = namePart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export default function SignInPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || null);
    }
    // Optionally, listen for auth state changes:
    // const unsubscribe = auth.onAuthStateChanged((user) => {
    //   setEmail(user?.email || null);
    // });
    // return () => unsubscribe();
  }, []);

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
