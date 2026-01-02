"use client";
// Eden Hebron
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

console.log("Button component imported:", Button);

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
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUserId(currentUser.uid);
    setEmail(currentUser.email); // Get email from auth directly

    async function fetchUserName() {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Check for name field in Firestore
            setUserName(userData.name || null);
            // Update email from Firestore if different
            if (userData.email) {
              setEmail(userData.email);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }
    fetchUserName();
  }, [router]);

  // Use userName if available, otherwise derive from email
  const displayName = userName || getFirstNameFromEmail(email);

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
        <img
          src="./print_transparent.svg"
          alt="GreenView Logo"
          className="w-[150px] mb-5 mx-auto"
        />

        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Welcome, {displayName}!
        </h2>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleProjectsClick}
            variant="forest"
            size="lg"
            className="w-full"
          >
            View Projects
          </Button>

          <Button
            onClick={handleNewProjectClick}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Create New Project
          </Button>
        </div>
      </div>
    </div>
  );
}
