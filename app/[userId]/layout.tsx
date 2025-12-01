"use client";

import React, { useEffect, useState } from "react";
import { db, app } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const firstName = namePart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export default function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    async function fetchUserName() {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const email = userSnap.data().email || null;
        setFirstName(getFirstNameFromEmail(email));
      }
      setIsLoading(false);
    }
    fetchUserName();
  }, [router]);

  if (isLoading) return null;

  return (
    <div className={poppins.className}>
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
      <main>{children}</main>
    </div>
  );
}
