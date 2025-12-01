"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function UserPage() {
  const params = useParams();
  const userId = params?.userId;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5dc",
        color: "#013220",
      }}
    >
      <h1>Welcome, User {userId}!</h1>
      {/* You can add more personalized content here */}
    </div>
  );
}
