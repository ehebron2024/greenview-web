"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/authentication/signInForm";
import SignUpForm from "@/components/authentication/signUpForm";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignInSuccess = (id: string) => {
    setIsLoggedIn(true);
    setUserId(id);
    router.push(`/${id}`);
  };

  const handleSignUpSuccess = (id: string) => {
    setIsLoggedIn(true);
    setUserId(id);
    router.push(`/${id}`);
  };

  const handleViewProjects = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser && userId) {
      router.push(`/${userId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-5">
      {/* Logo Section */}
      <img
        src="/print_transparent.svg"
        alt="GreenView Logo"
        className="w-[150px] mb-5"
      />

      {/* Conditional Rendering for Forms */}
      {!isLoggedIn ? (
        <div className="w-full max-w-md">
          {showSignUp ? (
            <>
              <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
              <p className="mt-5 text-center text-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setShowSignUp(false)}
                  className="text-primary underline cursor-pointer hover:text-accent bg-transparent border-none font-inherit"
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <SignInForm onSignInSuccess={handleSignInSuccess} />
              <p className="mt-5 text-center text-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => setShowSignUp(true)}
                  className="text-primary underline cursor-pointer hover:text-accent bg-transparent border-none font-inherit"
                >
                  Sign Up
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleViewProjects}
          className="px-5 py-2.5 bg-primary text-primary-foreground border-none rounded cursor-pointer text-base font-medium transition-colors hover:bg-accent"
        >
          View My Projects
        </button>
      )}
    </div>
  );
}
