"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

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
        {/* Home Button */}
        <button
          onClick={() =>
            user ? router.push(`/${user.uid}`) : router.push("/")
          }
          className="px-4 py-2 text-sm font-medium rounded-md transition-all text-white hover:bg-white/10"
        >
          Home
        </button>

        {/* Logo and Title - Center */}
        <div className="flex flex-col items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          <img
            src="/images/fulllogo_transparent_1.png"
            alt="GreenView Logo"
            className="w-40 h-40"
          />
        </div>

        {/* My Projects Button */}
        <button
          onClick={() =>
            user ? router.push(`/${user.uid}/userProjects`) : router.push("/")
          }
          className="px-4 py-2 text-sm font-medium rounded-md transition-all text-white hover:bg-white/10"
        >
          My Projects
        </button>
      </div>
    </nav>
  );
}
