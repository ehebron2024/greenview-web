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

  // Fetch admin stats
  useEffect(() => {
    if (!isAdmin || adminLoading) return;

    const fetchAdminStats = async () => {
      setLoadingStats(true);
      try {
        console.log("🔑 Admin: Fetching system statistics");

        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData: User[] = [];

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();

          // Count projects for each user
          const projectsSnapshot = await getDocs(
            collection(db, "users", userDoc.id, "projects")
          );

          usersData.push({
            id: userDoc.id,
            email: userData.email || "No email",
            name: userData.name,
            projectCount: projectsSnapshot.size,
          });
        }

        setAllUsers(usersData);

        // Get total project count using collectionGroup
        const allProjectsQuery = query(collectionGroup(db, "projects"));
        const allProjectsSnapshot = await getDocs(allProjectsQuery);
        setTotalProjects(allProjectsSnapshot.size);

        console.log(
          `✅ Found ${usersData.length} users with ${allProjectsSnapshot.size} total projects`
        );
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, [isAdmin, adminLoading]);

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

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
        {isAdmin && (
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
        {isAdmin && (
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
                      <p className="text-xs text-muted-foreground mt-1">
                        UID: {user.id.slice(0, 12)}...
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

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.id);
                        }}
                      >
                        View Projects →
                      </Button>
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
