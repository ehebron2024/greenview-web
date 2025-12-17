"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase";

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const firstName = namePart.split(/[._-]/)[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
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
      <div className="w-full max-w-md p-5 bg-card rounded-lg shadow-lg text-center">
        {/* Logo Section */}
        <img
          src="./print_transparent.svg"
          alt="GreenView Logo"
          className="w-[150px] mb-5 mx-auto"
        />

        {/* Projects Button */}
        <button
          onClick={handleProjectsClick}
          className="bg-primary text-primary-foreground px-6 py-2.5 text-base font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-accent"
        >
          View Projects
        </button>

        {/* New Project Button */}
        <button
          onClick={handleNewProjectClick}
          className="bg-primary text-primary-foreground px-6 py-2.5 text-base font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-accent mt-3 ml-3"
        >
          Create New Project
        </button>
      </div>
    </div>
  );
}
