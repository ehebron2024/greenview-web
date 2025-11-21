// src/components/UserProjects.tsx

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // Using alias for cleaner imports
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

const UserProjects: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This listener observes changes in the user's sign-in state
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state determined
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribeAuth();
  }, []); // Run once on component mount

  useEffect(() => {
    let unsubscribeFirestore: () => void; // For cleaning up the Firestore listener

    if (currentUser) {
      // If a user is logged in, fetch their projects
      const userProjectsCollectionRef = collection(
        db,
        "users",
        currentUser.uid,
        "projects"
      );
      console.log(`Fetching projects for user UID: ${currentUser.uid}`);

      // Set up a real-time listener for the user's projects
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
      // If no user is logged in, clear projects
      setProjects([]);
    }

    // Cleanup the Firestore listener when the component unmounts or user changes
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser]); // Re-run whenever the currentUser state changes

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (!currentUser) {
    return <p>Please sign in to view your projects.</p>;
  }

  return (
    <div>
      <h2>{currentUser.email}'s Projects</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {projects.length === 0 ? (
        <p>You have no projects yet. Start by adding one!</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              {/* Display other project details */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserProjects;
