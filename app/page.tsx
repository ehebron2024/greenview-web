"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Import Next.js Link component
import { useRouter } from "next/navigation";
import SignInForm from "@/components/authentication/signInForm";
import ProjectGallery from "@/components/projectGallery";
// Ensure Firebase is initialized in the "@/lib/firebase" module before calling getAuth
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if user is already signed in on mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Callback for successful login
  const handleSignInSuccess = (id: string) => {
    setIsLoggedIn(true);
    const auth = getAuth();
    const user = auth.currentUser;
    const email = user?.email;
    if (email) {
      router.push(`/${id}/userProjects?email=${encodeURIComponent(email)}`);
    } else {
      router.push(`/${id}/userProjects`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5dc", // Cream background
        color: "#013220", // Dark green text
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "#ffffff", // White background for the form container
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          textAlign: "center",
        }}
      >
        {/* Logo Section */}
        <img
          src="/images/fulllogo.jpg" // Replace with your logo path
          alt="GreenView Logo"
          style={{
            width: "150px",
            marginBottom: "20px",
            display: "block", // Ensures the image behaves like a block element
            margin: "0 auto", // Centers the image horizontally
          }}
        />

        {/* Heading Section */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Welcome to GreenView!
        </h1>

        {/* Conditional Rendering for Forms */}
        {!isLoggedIn ? (
          <>
            <SignInForm onSignInSuccess={handleSignInSuccess} />
            <p style={{ marginTop: "20px" }}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={{
                  color: "#013220",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </Link>
            </p>
          </>
        ) : (
          <p style={{ marginTop: "20px" }}>You are logged in!</p>
        )}
      </div>
    </div>
  );
}
