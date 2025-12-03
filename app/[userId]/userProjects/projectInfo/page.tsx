"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Project {
  id: string;
  name: string;
  number?: string;
  description?: string;
  createdAt: any;
  lastUpdated: any;
  status: string;
  budget?: number;
  contact?: string;
  location?: string;
  startDate?: any;
  userId?: string;
}

export default function ProjectInfoPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = searchParams.get("projectId");
  const userId = params.userId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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
        // Check if userId matches projectId
        if (projectId !== userId) {
          setError("This project does not belong to you");
          setLoading(false);
          return;
        }

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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {project.name}
        </h1>

        <div className="space-y-4">
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
            <div>
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
      </div>
    </div>
  );
}
