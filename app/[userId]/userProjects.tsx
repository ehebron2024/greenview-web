// src/components/UserProjects.tsx

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";

interface UserProjectsProps {
  userId: string;
}

const UserProjects: React.FC<UserProjectsProps> = ({ userId }) => {
  const [projects, setProjects] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

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
  }, [userId]);

  if (loading) return <p>Loading user projects...</p>;
  if (!userId) return <p>Please sign in to view your projects.</p>;

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
    </div>
  );
};

export default UserProjects;
