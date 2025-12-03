"use client";

import React, { useEffect, useState } from "react";
import { db, app } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import Image from "next/image";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const firstName = namePart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
        setIsLoading(false);
        return;
      }

      async function fetchUserName() {
        if (!currentUser) return;
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          const email = userSnap.data()?.email ?? null;
          if (email) {
            setFirstName(getFirstNameFromEmail(email));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchUserName();
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) return null;

  return (
    <div
      className={poppins.className}
      style={{
        backgroundColor: "#f5f5dc",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <header
        style={{
          padding: "20px",
          background: "#f5f5dc",
          color: "#013220",
          textAlign: "center",
          borderBottom: "2px solid #2e7d32",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Welcome, {firstName}!</h2>
      </header>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
