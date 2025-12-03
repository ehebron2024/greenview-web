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

    if (currentUser !== userId) {
      setError("Unauthorized: You do not have access to this project");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);projects", projectId);

        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(projectData);          if (projectData.userId !== currentUser) {
        } else {es not belong to you");
          setError("Project not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load project: ${errorMessage}`);          setProject(projectData);
        console.error('Project fetch error:', err);
      } finally {or("Project not found");
        setLoading(false);
      }atch (err) {
    };led to load project");

    fetchProject();
  }, [projectId, currentUser, userId]);g(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>No project data</div>;    fetchProject();
rrentUser, userId]);
  return (
    <div>  if (loading) return <div>Loading...</div>;
      <h1>{project.name}</h1>>;
      <div>iv>;
        <p>
          <strong>Status:</strong> {project.status}  return (
        </p>
        {project.description && (>{project.name}</h1>
          <p>
            <strong>Description:</strong> {project.description}
          </p>strong>Status:</strong> {project.status}
        )}
        {project.location && (ject.description && (
          <p>
            <strong>Location:</strong> {project.location}strong>Description:</strong> {project.description}
          </p>
        )}
        {project.clientName && (roject.location && (
          <p>
            <strong>Client:</strong> {project.clientName}strong>Location:</strong> {project.location}
          </p>
        )}
        {project.budget && (roject.clientName && (
          <p>
            <strong>Budget:</strong> ${project.budget.toLocaleString()}strong>Client:</strong> {project.clientName}
          </p>
        )}
        <p>roject.budget && (
          <strong>Created:</strong>{" "}
          {project.createdAt?.toDate?.().toLocaleDateString()}strong>Budget:</strong> ${project.budget.toLocaleString()}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}>
          {project.lastUpdated?.toDate?.().toLocaleDateString()}strong>Created:</strong>{" "}
        </p>.toLocaleDateString()}
      </div>
    </div>
  );strong>Last Updated:</strong>{" "}
}LocaleDateString()}
