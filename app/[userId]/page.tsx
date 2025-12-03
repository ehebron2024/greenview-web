"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

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
    <div
      className={poppins.className}
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
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Logo Section */}
        <img
          src="./print_transparent.svg"
          alt="GreenView Logo"
          style={{
            width: "150px",
            marginBottom: "20px",
            display: "block",
            margin: "0 auto",
          }}
        />

        {/* Projects Button */}
        <button
          onClick={handleProjectsClick}
          style={{
            backgroundColor: "#013220",
            color: "#ffffff",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0a1f17")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#013220")
          }
        >
          View Projects
        </button>

        {/* New Project Button */}
        <button
          onClick={handleNewProjectClick}
          style={{
            backgroundColor: "#013220",
            color: "#ffffff",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            marginTop: "12px",
            marginLeft: "12px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0a1f17")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#013220")
          }
        >
          Create New Project
        </button>
      </div>
    </div>
  );
}
