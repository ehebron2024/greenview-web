"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import Firestore instance from your lib/firebase.ts

export default function UserProjectsPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params; // Extract userId from the dynamic route
  const [userEmail, setUserEmail] = useState<string | null>(null); // State to store the user's email
  const [projects, setProjects] = useState<any[]>([]); // State to store the user's projects
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the user's email from Firestore
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserEmail(userData.email); // Set the user's email
        } else {
          console.error("User document does not exist.");
        }

        // Fetch the user's projects from Firestore
        const projectsRef = collection(db, `users/${userId}/projects`);
        const projectsSnapshot = await getDocs(projectsRef);

        const userProjects: any[] = [];
        projectsSnapshot.forEach((doc) => {
          userProjects.push({ id: doc.id, ...doc.data() });
        });

        setProjects(userProjects); // Update state with fetched projects
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading message while data is being fetched
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5dc", // Cream background
        color: "#013220", // Dark green text
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Welcome to Your Projects, {userEmail || "User"}!
      </h1>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "normal",
          marginBottom: "20px",
        }}
      >
        Your User ID: {userId}
      </h2>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "normal",
          marginBottom: "20px",
        }}
      >
        Your Email: {userEmail || "No email found"}
      </h3>
      <div>
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} style={{ marginBottom: "10px" }}>
              <h2>{project.name}</h2>
              <p>Number: {project.number}</p>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
}
