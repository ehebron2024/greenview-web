"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase";

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const nameParts = namePart.split(/[._-]/);

  return nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function UserPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUserId(currentUser.uid);

    async function fetchUserEmail() {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setEmail(userSnap.data().email || null);
        }
      }
    }
    fetchUserEmail();
  }, [router]);

  const firstName = getFirstNameFromEmail(email);

  const handleProjectsClick = () => {
    if (userId) {
      router.push(`/${userId}/userProjects`);
    }
  };

  const handleNewProjectClick = () => {
    if (userId) {
      router.push(`/${userId}/newProject`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg border border-border text-center">
        {/* Logo Section */}
        <img
          src="./print_transparent.svg"
          alt="GreenView Logo"
          className="w-[150px] mb-5 mx-auto"
        />

        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Welcome, {firstName}!
        </h2>

        <div className="flex flex-col gap-3">
          {/* View Projects Button - uses globals.css defaults */}
          <button onClick={handleProjectsClick} className="w-full">
            View Projects
          </button>

          {/* New Project Button - secondary style */}
          <button
            onClick={handleNewProjectClick}
            className="w-full bg-secondary text-secondary-foreground hover:bg-muted"
          >
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
}
