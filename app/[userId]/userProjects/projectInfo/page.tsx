"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ShareProject from "@/components/share-project";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";

interface Room {
  id: string;
  name: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  number?: string;
  description?: string;
  createdAt: any;
  lastUpdated: any;
  status: string;
  budget?: string;
  contact?: string;
  location?: string;
  startDate?: any;
  userId?: string;
  roomCount?: number;
  allowCopy?: boolean;
  isPublic?: boolean;
  originalOwnerId?: string;
  originalProjectId?: string;
  isSharedCopy?: boolean;
  sharedWith?: Array<{
    email: string;
    permission: string;
    allowCopy: boolean;
    sharedAt: string;
  }>;
}

export default function ProjectInfoPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const userId = params.userId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!projectId || !userId) {
      if (!projectId) setError("No project ID provided");
      if (!userId) setError("No user ID provided");
      return;
    }

    // Don't fetch until we know current user and admin status
    if (!currentUser || adminLoading) {
      return;
    }

    const fetchProject = async () => {
      try {
        console.log("🔍 Fetching project:", {
          projectId,
          userId,
          currentUser,
          isAdmin,
        });

        // Check if user has permission to view this project
        const isOwnProject = userId === currentUser;
        const hasPermission = isOwnProject || isAdmin;

        if (!hasPermission) {
          console.warn("⚠️ User doesn't have permission to view this project");
          setError("You don't have permission to view this project");
          setTimeout(() => {
            router.push(`/${currentUser}/userProjects`);
          }, 2000);
          return;
        }

        const docRef = doc(db, "users", userId, "projects", projectId);
        console.log("📄 Fetching document from:", docRef.path);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          console.log("✅ Project found:", projectData);
          setProject(projectData);
          setError(null);
        } else {
          console.error("❌ Project document does not exist");
          setError("Project not found");
          setTimeout(() => {
            router.push(`/${currentUser}/userProjects`);
          }, 2000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Project fetch error:", err);
        setError(`Failed to load project: ${errorMessage}`);
        setTimeout(() => {
          router.push(`/${currentUser}/userProjects`);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, currentUser, userId, router, isAdmin, adminLoading]);

  useEffect(() => {
    if (project && currentUser) {
      setIsOwner(currentUser === userId);
    }
  }, [project, currentUser, userId]);

  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canShare = isOwner; // Only owners can share

  const handleDeleteProject = async () => {
    if (!canDelete || !projectId) {
      alert("You don't have permission to delete this project");
      return;
    }

    const confirmMessage =
      isAdmin && !isOwner
        ? "⚠️ Project Action: Are you sure you want to delete this user's project? This cannot be undone."
        : "Are you sure you want to delete this project? This cannot be undone.";

    if (!confirm(confirmMessage)) return;

    try {
      await deleteDoc(doc(db, "users", userId, "projects", projectId));
      alert("Project deleted successfully");
      router.push(`/${currentUser}/userProjects`);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-lg max-w-md text-center">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg">No project data</div>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isAdmin && !isOwner && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
            <div>
              <p className="font-semibold">Admin Mode</p>
              <p className="text-xs">
                You're viewing another user's project (Owner:{" "}
                {project?.originalOwnerId ||
                  project?.sharedWith?.[0]?.email ||
                  "Unknown"}
                )
              </p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-8">
          {/* Header with Title and Share Button */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {project.name}
              </h1>
              {project.number && (
                <p className="text-sm text-muted-foreground mt-1">
                  Project #{project.number}
                </p>
              )}
            </div>
            {canShare && (
              <Button onClick={() => setShowShare(true)} variant="forest">
                Share Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <p className="text-lg text-foreground">{project.status}</p>
            </div>

            {project.number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Project Number
                </p>
                <p className="text-lg text-foreground">{project.number}</p>
              </div>
            )}

            {project.description && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-lg text-foreground">{project.description}</p>
              </div>
            )}

            {project.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="text-lg text-foreground">{project.location}</p>
              </div>
            )}

            {project.contact && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact
                </p>
                <p className="text-lg text-foreground">{project.contact}</p>
              </div>
            )}

            {project.budget && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Budget
                </p>
                <p className="text-lg text-foreground">
                  ${project.budget.toLocaleString()}
                </p>
              </div>
            )}

            {project.startDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-lg text-foreground">
                  {formatDate(project.startDate)}
                </p>
              </div>
            )}

            {project.roomCount !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Room Count
                </p>
                <p className="text-lg text-foreground">{project.roomCount}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-lg text-foreground">
                {formatDate(project.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-lg text-foreground">
                {formatDate(project.lastUpdated)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-border mt-8">
            {canEdit && (
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    projectId: projectId!,
                    mode: "edit",
                  });
                  router.push(`/${userId}/newProject?${params.toString()}`);
                }}
                variant="forest"
                className="flex-1"
              >
                {isAdmin && !isOwner
                  ? "Edit Project (Manager)"
                  : "Edit Project"}
              </Button>
            )}

            {canDelete && (
              <Button
                onClick={handleDeleteProject}
                variant="destructive"
                className="flex-1"
              >
                {isAdmin && !isOwner ? "Delete (Manager)" : "Delete Project"}
              </Button>
            )}

            <Button
              onClick={() => router.push(`/${currentUser}/userProjects`)}
              variant="secondary"
              className="flex-1"
            >
              Back to Projects
            </Button>
          </div>
        </div>

        {/* Rooms Button - Separated at bottom */}
        <div className="mt-6">
          <Button
            onClick={() =>
              router.push(
                `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
              )
            }
            variant="forest"
            size="lg"
            className="w-full"
          >
            View Rooms ({project.roomCount || 0})
          </Button>
        </div>
      </div>

      {/* Share Project Modal */}
      {showShare && canShare && projectId && (
        <ShareProject
          projectId={projectId}
          projectName={project.name}
          userId={userId}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
