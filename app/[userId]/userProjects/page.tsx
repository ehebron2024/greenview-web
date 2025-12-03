"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import ProjectGallery from "@/components/projectGallery";

interface UserProjectsProps {}

const UserProjects: React.FC<UserProjectsProps> = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUserId(currentUser.uid);
  }, [router]);

  const handleNewProjectClick = () => {
    if (userId) {
      router.push(`/${userId}/newProject`);
    }
  };

  return (
    <div>
      <ProjectGallery />
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
          marginLeft: "12px",
        }}
      >
        Create New Project
      </button>
    </div>
  );
};

export default UserProjects;
