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
    <div className="min-h-screen bg-background p-5">
      <ProjectGallery />
      <button onClick={handleNewProjectClick} className="mt-5 ml-3">
        Create New Project
      </button>
    </div>
  );
};

export default UserProjects;
