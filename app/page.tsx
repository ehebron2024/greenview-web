"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/authentication/signInForm";
import SignUpForm from "@/components/authentication/signUpForm";
import { getAuth } from "firebase/auth";
import { Button } from "@/components/ui/button";

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
      <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
        <img
          src="/print_transparent.svg"
          alt="GreenView Logo"
          className="w-[200px] mb-5"
        />

        {!isLoggedIn ? (
          <div className="w-full max-w-md">
            {showSignUp ? (
              <>
                <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
                <p className="mt-5 text-center text-foreground">
                  Already have an account?{" "}
                  <Button
                    onClick={() => setShowSignUp(false)}
                    className="p-0 h-auto"
                  >
                    Sign In
                  </Button>
                </p>
              </>
            ) : (
              <>
                <SignInForm onSignInSuccess={handleSignInSuccess} />
                <p className="mt-5 text-center text-foreground">
                  Don't have an account?{" "}
                  <Button
                    onClick={() => setShowSignUp(true)}
                    className="p-0 h-auto"
                  >
                    Sign Up
                  </Button>
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Button onClick={handleViewProjects} variant="forest" size="lg">
              View My Projects
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
