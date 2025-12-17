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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>No project data</div>;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          {/* Header with Title and Share Button */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg text-gray-900">{project.status}</p>
            </div>

            {project.number && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Project Number
                </p>
                <p className="text-lg text-gray-900">{project.number}</p>
              </div>
            )}

            {project.description && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-lg text-gray-900">{project.description}</p>
              </div>
            )}

            {project.location && (
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-lg text-gray-900">{project.location}</p>
              </div>
            )}

            {project.contact && (
              <div>
                <p className="text-sm font-medium text-gray-600">Contact</p>
                <p className="text-lg text-gray-900">{project.contact}</p>
              </div>
            )}

            {project.budget && (
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-lg text-gray-900">
                  ${project.budget.toLocaleString()}
                </p>
              </div>
            )}

            {project.startDate && (
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-lg text-gray-900">
                  {formatDate(project.startDate)}
                </p>
              </div>
            )}

            {project.roomCount && (
              <div>
                <p className="text-sm font-medium text-gray-600">Room Count</p>
                <p className="text-lg text-gray-900">{project.roomCount}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-lg text-gray-900">
                {formatDate(project.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-lg text-gray-900">
                {formatDate(project.lastUpdated)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t mt-8">
            {isOwner && (
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    projectId: projectId!,
                    mode: "edit",
                  });
                  router.push(`/${userId}/newProject?${params.toString()}`);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Edit Project
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Rooms Navigation */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
                  )
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {project.name ? `${project.name} Rooms` : "Project's Rooms"}
              </button>
            </div>
          </div>
          <p className="text-gray-600">
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
