"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  collectionGroup,
  query,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  userId: string;
  number?: string;
  location?: string;
  budget?: string;
}

const UserProjects: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUserId(currentUser.uid);
  }, [router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;

      try {
        let allProjects: Project[] = [];

        if (isAdmin) {
          // Admin: Use collectionGroup to fetch ALL projects across all users
          console.log(
            "🔑 Project Manager Mode: Fetching all projects using collectionGroup"
          );

          const projectsQuery = query(collectionGroup(db, "projects"));
          const projectsSnapshot = await getDocs(projectsQuery);

          projectsSnapshot.forEach((doc) => {
            // Extract userId from the document path
            // Path format: users/{userId}/projects/{projectId}
            const pathParts = doc.ref.path.split("/");
            const userIdFromPath = pathParts[1]; // users/{userId}/projects/{projectId}

            allProjects.push({
              id: doc.id,
              userId: userIdFromPath,
              ...doc.data(),
            } as Project);
          });

          console.log(
            `✅ Fetched ${allProjects.length} projects from all users`
          );
        } else {
          // Regular user: Only their projects
          const projectsRef = collection(db, "users", userId, "projects");
          const projectsSnapshot = await getDocs(projectsRef);

          projectsSnapshot.forEach((doc) => {
            allProjects.push({
              id: doc.id,
              userId: userId,
              ...doc.data(),
            } as Project);
          });
        }

        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && !adminLoading) {
      fetchProjects();
    }
  }, [userId, isAdmin, adminLoading]);

  const handleNewProjectClick = () => {
    if (userId) {
      router.push(`/${userId}/newProject`);
    }
  };

  const handleProjectClick = (projectId: string, projectUserId: string) => {
    router.push(
      `/${projectUserId}/userProjects/projectInfo?projectId=${projectId}`
    );
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? "All Projects (Admin)" : "My Projects"}
          </h1>
          <Button onClick={handleNewProjectClick} variant="forest" size="lg">
            Create New Project
          </Button>
        </div>

        {isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            🔑 Admin Mode: Viewing all user projects ({projects.length} total)
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No projects found</p>
            <Button
              onClick={handleNewProjectClick}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id, project.userId)}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {project.name}
                </h3>

                {isAdmin && project.userId !== userId && (
                  <div className="mb-2 px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs text-amber-800">
                    Owner: {project.name}....
                  </div>
                )}

                {project.number && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Project #: {project.number}
                  </p>
                )}

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description || "No description"}
                </p>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Status:</span>{" "}
                    {project.status}
                  </p>
                  {project.location && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Location:</span>{" "}
                      {project.location}
                    </p>
                  )}
                  {project.budget && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Budget:</span> $
                      {project.budget}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProjects;
