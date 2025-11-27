"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function UserProjectsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Handler for starting a new project (replace with your logic)
  const handleStartNewProject = () => {
    alert("Start a new project clicked!");
    // You can open a modal, navigate, or show a form here
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user && user.uid) {
        setUserEmail(user.email);
        setUserId(user.uid);

        // Fetch user document by UID (not by email)
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Fetch projects for this user
          const projectsRef = collection(db, `users/${user.uid}/projects`);
          const projectsSnapshot = await getDocs(projectsRef);

          const userProjects: any[] = [];
          projectsSnapshot.forEach((doc) => {
            userProjects.push({ id: doc.id, ...doc.data() });
          });

          setProjects(userProjects);
        } else {
          setProjects([]);
          console.error("No user found with this UID.");
        }
      } else {
        setUserEmail(null);
        setUserId(null);
        setProjects([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5dc",
        color: "#013220",
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
        Welcome to Your Projects, {userEmail ? userEmail.split("@")[0] : "User"}
        !
      </h1>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "normal",
          marginBottom: "20px",
        }}
      >
        Your User ID: {userId || "Not found"}
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
      <button
        onClick={() => (window.location.href = "/newProject")}
        style={{
          marginBottom: "30px",
          padding: "12px 24px",
          backgroundColor: "#013220",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "background-color 0.3s",
        }}
      >
        Start a New Project
      </button>
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
