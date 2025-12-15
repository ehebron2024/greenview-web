"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function ProtectedSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading) return null;
  return (
    <div style={{ backgroundColor: "#f5f5dc", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
