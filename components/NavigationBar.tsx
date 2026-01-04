"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLogoClick = () => {
    if (user) {
      router.push(`/${user.uid}`);
    } else {
      router.push("/");
    }
  };

  const isHomePage = pathname === "/";

  if (loading) {
    return (
      <nav className="bg-card shadow-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/print_transparent.svg"
                alt="GreenView Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card shadow-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition"
            >
              <img
                src="/print_transparent.svg"
                alt="GreenView Logo"
                className="h-10 w-auto"
              />
            </button>

            {/* Admin Badge in Navbar */}
            {!adminLoading && isAdmin && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full">
                <span className="text-amber-800 text-sm">🔑</span>
                <span className="text-amber-800 text-xs font-semibold">
                  ADMIN
                </span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Mobile Admin Badge */}
                {!adminLoading && isAdmin && (
                  <div className="md:hidden flex items-center">
                    <span className="text-amber-800 text-lg">🔑</span>
                  </div>
                )}

                {/* User Email */}
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.email}
                </span>

                {/* Dashboard Button */}
                {!isHomePage && (
                  <Button
                    onClick={handleLogoClick}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    Dashboard
                  </Button>
                )}

                {/* Projects Button */}
                <Button
                  onClick={() => router.push(`/${user.uid}/userProjects`)}
                  variant="ghost"
                  size="sm"
                >
                  {isAdmin ? "All Projects" : "My Projects"}
                </Button>

                {/* Sign Out Button */}
                <Button onClick={handleSignOut} variant="destructive" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  variant="forest"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
