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
  description?: string;
  createdAt: any;
  lastUpdated: any;
  status: string;
  clientId?: string;
  clientName?: string;
  budget?: number;
  location?: string;
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

        const docRef = doc(db, "projects", projectId);
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

  return (
    <div>
      <h1>{project.name}</h1>
      <div>
        <p>
          <strong>Status:</strong> {project.status}
        </p>
        {project.description && (
          <p>
            <strong>Description:</strong> {project.description}
          </p>
        )}
        {project.location && (
          <p>
            <strong>Location:</strong> {project.location}
          </p>
        )}
        {project.clientName && (
          <p>
            <strong>Client:</strong> {project.clientName}
          </p>
        )}
        {project.budget && (
          <p>
            <strong>Budget:</strong> ${project.budget.toLocaleString()}
          </p>
        )}
        <p>
          <strong>Created:</strong>{" "}
          {project.createdAt?.toDate?.().toLocaleDateString()}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          {project.lastUpdated?.toDate?.().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
