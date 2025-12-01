// src/components/UserProjects.tsx

"use client";

import React, { useState, useEffect } from "react";
import { db, app } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

interface UserProjectsProps {}

const UserProjects: React.FC<UserProjectsProps> = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    const userId = currentUser.uid;
    setUserId(userId);
    const userProjectsCollectionRef = collection(
      db,
      "users",
      userId,
      "projects"
    );

    const unsubscribe = onSnapshot(
      userProjectsCollectionRef,
      (querySnapshot) => {
        const userProjects: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          userProjects.push({ id: doc.id, ...doc.data() });
        });
        setProjects(userProjects);
        setError(null);
        setLoading(false);
      },
      (firestoreError) => {
        setError(`Failed to load projects: ${firestoreError.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleNewProjectClick = () => {
    if (userId) {
      router.push(`/${userId}/newProject`);
    }
  };

  if (loading) return <p>Loading user projects...</p>;

  return (
    <div>
      <h2>Projects</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {projects.length === 0 ? (
        <p>You have no projects yet. Start by adding one!</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleNewProjectClick}
        style={{
          backgroundColor: "#013220",
          color: "#ffffff",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Create New Project
      </button>
    </div>
  );
};

export default UserProjects;
