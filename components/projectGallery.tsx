import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  DocumentData,
  doc,
  getDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";

const ProjectGallery: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [projects, setProjects] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch user name from Firestore
  useEffect(() => {
    if (currentUser) {
      const fetchUserName = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserName(userSnap.data().name || currentUser.email || "");
          }
        } catch (err) {
          console.error("Error fetching user name:", err);
          setUserName(currentUser.email || "");
        }
      };

      fetchUserName();
    }
  }, [currentUser]);

  useEffect(() => {
    let unsubscribeFirestore: () => void;

    if (currentUser) {
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
          setError(null);
        },
        (firestoreError) => {
          console.error("Error fetching user's projects:", firestoreError);
          setError(`Failed to load projects: ${firestoreError.message}`);
        }
      );
    } else {
      setProjects([]);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser]);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (currentUser) {
      router.push(
        `/${currentUser.uid}/userProjects/projectInfo?projectId=${projectId}`
      );
    }
  };

  if (loading) {
    return <p>Loading projects...</p>;
  }

  if (!currentUser) {
    return <p>Please sign in to view your projects.</p>;
  }

  return (
    <div style={{ padding: "20px", marginBottom: "30px" }}>
      <h2
        style={{ color: "#013220", fontWeight: "bold", marginBottom: "20px" }}
      >
        {userName}'s Project Gallery
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
              onClick={() => handleProjectClick(project.id)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "transform 0.2s, boxShadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src="/fulllogo.jpg"
                    alt="GreenView Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
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
