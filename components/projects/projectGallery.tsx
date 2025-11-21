import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // Ensure this file exists and exports 'auth' and 'db'
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";

const ProjectGallery: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Observe changes in the user's sign-in state
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state determined
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore: () => void;

    if (currentUser) {
      // Fetch the user's projects from Firestore
      const userProjectsCollectionRef = collection(
        db,
        "users",
        currentUser.uid,
        "projects"
      );

      unsubscribeFirestore = onSnapshot(
        userProjectsCollectionRef,
        (querySnapshot) => {
          const userProjects: DocumentData[] = [];
          querySnapshot.forEach((doc) => {
            userProjects.push({ id: doc.id, ...doc.data() });
          });
          setProjects(userProjects);
          setError(null); // Clear any previous errors
        },
        (firestoreError) => {
          console.error("Error fetching user's projects:", firestoreError);
          setError(`Failed to load projects: ${firestoreError.message}`);
        }
      );
    } else {
      // Clear projects if no user is logged in
      setProjects([]);
    }

    // Cleanup the Firestore listener when the component unmounts or user changes
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser]);

  if (loading) {
    return <p>Loading projects...</p>;
  }

  if (!currentUser) {
    return <p>Please sign in to view your projects.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{ color: "#013220", fontWeight: "bold", marginBottom: "20px" }}
      >
        {currentUser.email}'s Project Gallery
      </h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {projects.length === 0 ? (
        <p>You have no projects yet. Start by adding one!</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={project.imageUrl}
                alt={project.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: "10px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
