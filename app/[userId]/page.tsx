"use client";
// Eden Hebron
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  collectionGroup,
  query,
} from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";

function getFirstNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const nameParts = namePart.split(/[._-]/);

  return nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

interface User {
  id: string;
  email: string;
  name?: string;
  projectCount?: number;
}

export default function UserPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUserId(currentUser.uid);
    setEmail(currentUser.email);

    async function fetchUserName() {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserName(userData.name || null);
            if (userData.email) {
              setEmail(userData.email);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }
    fetchUserName();
  }, [router]);

  // Fetch admin stats with better error handling
  useEffect(() => {
    if (!isAdmin || adminLoading) {
      console.log("⏸️ Skipping admin stats:", { isAdmin, adminLoading });
      return;
    }

    const fetchAdminStats = async () => {
      setLoadingStats(true);
      setError(null);

      try {
        console.log("🔑 Admin: Starting to fetch system statistics");

        // First verify admin token
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();
          console.log("🎫 Token claims:", token.claims);

          if (!token.claims.admin) {
            throw new Error(
              "Admin claim not found in token. Please sign out and sign back in."
            );
          }
        }

        // Fetch all users with timeout
        console.log("📊 Fetching users collection...");
        const usersPromise = getDocs(collection(db, "users"));
        const usersSnapshot = (await Promise.race([
          usersPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Users fetch timeout")), 10000)
          ),
        ])) as any;

        console.log(`✅ Found ${usersSnapshot.size} users`);
        const usersData: User[] = [];

        // Fetch projects for each user
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          console.log(`👤 Processing user: ${userData.email || userDoc.id}`);

          try {
            const projectsRef = collection(db, "users", userDoc.id, "projects");
            const projectsSnapshot = await getDocs(projectsRef);
            console.log(
              `   📁 Found ${projectsSnapshot.size} projects for ${userData.email}`
            );

            usersData.push({
              id: userDoc.id,
              email: userData.email || "No email",
              name: userData.name,
              projectCount: projectsSnapshot.size,
            });
          } catch (projectError: any) {
            console.error(
              `⚠️ Error fetching projects for user ${userDoc.id}:`,
              projectError
            );

            // Add user even if projects fail
            usersData.push({
              id: userDoc.id,
              email: userData.email || "No email",
              name: userData.name,
              projectCount: 0,
            });
          }
        }

        setAllUsers(usersData);

        // Get total project count using collectionGroup
        console.log("📊 Fetching all projects using collectionGroup...");
        const allProjectsQuery = query(collectionGroup(db, "projects"));

        const projectsPromise = getDocs(allProjectsQuery);
        const allProjectsSnapshot = (await Promise.race([
          projectsPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Projects fetch timeout")), 15000)
          ),
        ])) as any;

        console.log(`✅ Found ${allProjectsSnapshot.size} total projects`);
        setTotalProjects(allProjectsSnapshot.size);

        console.log(
          `✅ Successfully loaded ${usersData.length} users with ${allProjectsSnapshot.size} total projects`
        );
      } catch (error: any) {
        console.error("❌ Error fetching admin stats:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);

        // Set user-friendly error message
        if (error.message?.includes("timeout")) {
          setError(
            "Request timed out. The database may be slow or unavailable."
          );
        } else if (error.code === "permission-denied") {
          setError(
            "Permission denied. Please check Firestore rules and ensure admin claim is set."
          );
        } else if (error.code === "cancelled") {
          setError(
            "Request was cancelled. This may be a permissions issue. Try signing out and back in."
          );
        } else if (error.message?.includes("Admin claim")) {
          setError(error.message);
        } else if (error.code === "unavailable") {
          setError("Firestore is temporarily unavailable. Please try again.");
        } else {
          setError(
            `Failed to load admin data: ${error.message || "Unknown error"}`
          );
        }

        // Reset data on error
        setAllUsers([]);
        setTotalProjects(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, [isAdmin, adminLoading]);

  const forceTokenRefresh = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      alert("No user logged in");
      return;
    }

    try {
      console.log("🔄 Forcing token refresh...");
      const token = await user.getIdToken(true); // Force refresh
      console.log("✅ Token refreshed");

      const tokenResult = await user.getIdTokenResult();
      console.log("📋 New token claims:", tokenResult.claims);
      console.log("🔑 Admin claim:", tokenResult.claims.admin);

      if (tokenResult.claims.admin) {
        alert("✅ Admin claim verified! Refreshing page...");
        window.location.reload();
      } else {
        alert("❌ Admin claim NOT found. Run setAdmin.js script.");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert(`Error: ${error}`);
    }
  };

  const debugAndRefreshToken = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      alert("❌ No user logged in");
      return;
    }

    try {
      console.log("=== TOKEN DEBUG START ===");
      console.log("👤 User:", user.email);

      // Check current token
      console.log("\n📋 BEFORE REFRESH:");
      const oldToken = await user.getIdTokenResult();
      console.log("  Admin claim:", oldToken.claims.admin);
      console.log("  Token issued at:", new Date(oldToken.issuedAtTime));

      // Force refresh
      console.log("\n🔄 Forcing token refresh...");
      await user.getIdToken(true);

      // Check new token
      console.log("\n📋 AFTER REFRESH:");
      const newToken = await user.getIdTokenResult();
      console.log("  Admin claim:", newToken.claims.admin);
      console.log("  Token issued at:", new Date(newToken.issuedAtTime));
      console.log("  All claims:", newToken.claims);
      console.log("=== TOKEN DEBUG END ===\n");

      if (newToken.claims.admin === true) {
        alert(
          "✅ SUCCESS! Admin claim verified!\n\nPage will reload in 2 seconds."
        );
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert(
          "❌ Admin claim is STILL NOT in your token.\n\nYou MUST:\n1. Click 'Sign Out' button\n2. Close ALL browser tabs\n3. Open fresh tab and sign in again\n\nThe token is cached and won't update otherwise."
        );
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const displayName = userName || getFirstNameFromEmail(email);

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

  const handleUserClick = (targetUserId: string) => {
    router.push(`/${targetUserId}/userProjects`);
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading admin status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-lg text-destructive">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-lg">Error Loading Data</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleRetry} variant="outline" size="sm">
                🔄 Retry
              </Button>
              <Button
                onClick={debugAndRefreshToken}
                variant="secondary"
                size="sm"
              >
                🔍 Debug & Refresh Token
              </Button>
              <Button
                onClick={() => {
                  getAuth(app)
                    .signOut()
                    .then(() => {
                      alert(
                        "✅ Signed out!\n\nNow sign in again with a fresh session."
                      );
                      router.push("/");
                    });
                }}
                variant="destructive"
                size="sm"
              >
                🚪 Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Admin Badge */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              <div>
                <p className="font-bold text-lg">Administrator Access</p>
                <p className="text-sm">
                  You have full system access to all users and projects
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Temporary Buttons */}
        {isAdmin && (
          <div className="mb-6 flex gap-4">
            <Button onClick={forceTokenRefresh} variant="outline">
              🔄 Refresh Admin Token
            </Button>
            <Button
              onClick={() => {
                const auth = getAuth(app);
                auth
                  .signOut()
                  .then(() => alert("Signed out. Please sign in again."));
              }}
              variant="destructive"
            ></Button>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-8">
          <div className="text-center mb-8">
            <img
              src="./print_transparent.svg"
              alt="GreenView Logo"
              className="w-[150px] mb-5 mx-auto"
            />
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Welcome, {displayName}!
            </h2>
            {isAdmin && (
              <p className="text-muted-foreground">Administrator Dashboard</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Button
              onClick={handleProjectsClick}
              variant="forest"
              size="lg"
              className="w-full"
            >
              {isAdmin ? "View All Projects" : "View My Projects"}
            </Button>

            <Button
              onClick={handleNewProjectClick}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Create New Project
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        {isAdmin && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg shadow border border-border p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {loadingStats ? "..." : allUsers.length}
              </p>
              <p className="text-muted-foreground">Total Users</p>
            </div>
            <div className="bg-card rounded-lg shadow border border-border p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {loadingStats ? "..." : totalProjects}
              </p>
              <p className="text-muted-foreground">Total Projects</p>
            </div>
            <div className="bg-card rounded-lg shadow border border-border p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {loadingStats
                  ? "..."
                  : allUsers.length > 0
                  ? (totalProjects / allUsers.length).toFixed(1)
                  : "0"}
              </p>
              <p className="text-muted-foreground">Avg Projects/User</p>
            </div>
          </div>
        )}

        {/* Admin Users List */}
        {isAdmin && !error && (
          <div className="bg-card rounded-lg shadow-lg border border-border p-8">
            <h3 className="text-2xl font-bold mb-6 text-foreground">
              All Users ({allUsers.length})
            </h3>

            {loadingStats ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent/50 transition cursor-pointer border border-border"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {user.name || getFirstNameFromEmail(user.email)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {user.projectCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.projectCount === 1 ? "project" : "projects"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
