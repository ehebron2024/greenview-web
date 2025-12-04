"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
        return;
      }
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div style={{ backgroundColor: "#f5f5dc", minHeight: "100vh" }}>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
