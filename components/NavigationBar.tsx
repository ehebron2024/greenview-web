"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

export default function NavigationBar() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) return null;

  return (
    <nav
      className="sticky top-0 z-50 py-10 px-4 border-b border-[var(--border)] shadow-sm"
      style={{ background: "rgba(15, 46, 41, .94)" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button
          onClick={() =>
            user ? router.push(`/${user.uid}`) : router.push("/")
          }
          variant="forest-inverted"
          size="sm"
        >
          Home
        </Button>

        <div className="flex flex-col items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          <img
            src="/images/fulllogo_transparent_1.png"
            alt="GreenView Logo"
            className="w-40 h-40"
          />
        </div>

        <Button
          onClick={() =>
            user ? router.push(`/${user.uid}/userProjects`) : router.push("/")
          }
          variant="forest-inverted"
          size="sm"
        >
          My Projects
        </Button>
      </div>
    </nav>
  );
}
