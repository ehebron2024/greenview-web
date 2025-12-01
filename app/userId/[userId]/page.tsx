"use client";

import { useParams } from "next/navigation";
import UserProjects from "./userProjects";

export default function ProjectsPage() {
  const userId = "defaultUserId"; // Replace with your desired default userId
  return <UserProjects userId={userId} />;
}
