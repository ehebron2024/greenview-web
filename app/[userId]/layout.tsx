"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/hooks/useAdmin";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useUser();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    // If not loading and no user, redirect to home
    if (!loading && !user) {
      router.push("/");
      return;
    }

    // If user exists and not admin, check if they're accessing their own route
    if (!loading && !adminLoading && user) {
      const routeUserId = params.userId as string;
      const isOwnRoute = user.uid === routeUserId;

      // Only redirect if user is NOT admin and trying to access someone else's route
      if (!isAdmin && !isOwnRoute) {
        console.warn("Non-admin user trying to access another user's route");
        router.push(`/${user.uid}/userProjects`);
      }
    }
  }, [user, loading, isAdmin, adminLoading, router, params.userId]);

  // Show loading state while checking auth and admin status
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
