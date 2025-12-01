"use client";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // Using alias for cleaner imports
import { User } from "firebase/auth";
import {
  query,
  where,
  getDocs,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userId = auth.currentUser?.uid; // Get userId from Firebase auth
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const newProjectRef = doc(collection(db, "users", userId, "projects"));
      await setDoc(newProjectRef, {
        name,
        description,
        createdAt: new Date(),
      });
      router.push(`/userId/${userId}/projects`);
    } catch (err: any) {
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
