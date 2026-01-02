"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  userId: string;
  // ...other fields
}

interface ProjectGalleryProps {
  currentUser: { uid: string; email: string | null } | null;
}

export default function ProjectGallery({ currentUser }: ProjectGalleryProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser?.uid) return;

      try {
        let allProjects: Project[] = [];

        if (isAdmin) {
          // Admin: Fetch ALL projects from ALL users
          console.log("🔑 Admin mode: Fetching all projects");
          const usersSnapshot = await getDocs(collection(db, "users"));

          for (const userDoc of usersSnapshot.docs) {
            const projectsRef = collection(db, "users", userDoc.id, "projects");
            const projectsSnapshot = await getDocs(projectsRef);

            projectsSnapshot.forEach((doc) => {
              allProjects.push({
                id: doc.id,
                userId: userDoc.id,
                ...doc.data(),
              } as Project);
            });
          }
        } else {
          // Regular user: Only their projects
          const projectsRef = collection(
            db,
            "users",
            currentUser.uid,
            "projects"
          );
          const projectsSnapshot = await getDocs(projectsRef);

          projectsSnapshot.forEach((doc) => {
            allProjects.push({
              id: doc.id,
              userId: currentUser.uid,
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

    if (!adminLoading) {
      fetchProjects();
    }
  }, [currentUser, isAdmin, adminLoading]);

  const handleDeleteProject = async (
    projectId: string,
    projectUserId: string
  ) => {
    const canDelete = isAdmin || projectUserId === currentUser?.uid;

    if (!canDelete) {
      alert("You don't have permission to delete this project");
      return;
    }

    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteDoc(doc(db, "users", projectUserId, "projects", projectId));
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const handleProjectClick = (projectId: string, projectUserId: string) => {
    router.push(
      `/${projectUserId}/userProjects/projectInfo?projectId=${projectId}`
    );
  };

  if (loading || adminLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          🔑 Admin Mode: Viewing all user projects
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div
              onClick={() => handleProjectClick(project.id, project.userId)}
              className="cursor-pointer"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">
                {project.name}
              </h3>
              {isAdmin && project.userId !== currentUser?.uid && (
                <p className="text-xs text-amber-600 mb-2">
                  Owner ID: {project.userId}
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {project.description || "No description"}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {project.status}
              </p>
            </div>

            {(isAdmin || project.userId === currentUser?.uid) && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id, project.userId);
                }}
                variant="destructive"
                size="sm"
                className="mt-4 w-full"
              >
                Delete Project
              </Button>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No projects found
          </div>
        )}
      </div>
    </div>
  );
}
