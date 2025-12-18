"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ShareProject from "@/components/share-project";
import { Share2 } from "lucide-react";

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
    if (!projectId || !currentUser) {
      if (!projectId) setError("No project ID provided");
      return;
    }

    const fetchProject = async () => {
      try {
        const docRef = doc(db, "users", userId, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(projectData);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load project: ${errorMessage}`);
        console.error("Project fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, currentUser, userId]);

  useEffect(() => {
    if (project && currentUser) {
      setIsOwner(currentUser === userId);
    }
  }, [project, currentUser, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-lg">
          Error: {error}
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
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-8">
          {/* Header with Title and Share Button */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-accent transition-colors shadow-sm"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
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

            {project.roomCount && (
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
            {isOwner && (
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    projectId: projectId!,
                    mode: "edit",
                  });
                  router.push(`/${userId}/newProject?${params.toString()}`);
                }}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-accent transition-colors shadow-sm"
              >
                Edit Project
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm"
            >
              Back
            </button>
          </div>
        </div>

        {/* Rooms Navigation */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Rooms</h2>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
                  )
                }
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors shadow-sm"
              >
                {project.name ? `${project.name} Rooms` : "Project's Rooms"}
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">
            View and manage rooms on the next page.
          </p>
        </div>
      </div>

      {/* Share Project Modal */}
      {showShare && isOwner && projectId && (
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
