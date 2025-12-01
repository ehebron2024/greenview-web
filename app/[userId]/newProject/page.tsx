"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface UserFormData {
  email: string;
  name: string;
  number: string;
  projectName: string;
}

interface ProjectFormData {
  name: string;
  number: string;
  dateStarted: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: "",
    name: "",
    number: "",
    projectName: "",
  });

  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: "",
    number: "",
    dateStarted: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      // Save user data to user document
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          email: userFormData.email,
          name: userFormData.name,
          number: userFormData.number,
          projectName: userFormData.projectName,
        },
        { merge: true }
      );

      // Save project data to projects subcollection
      const projectsCollectionRef = collection(db, "users", userId, "projects");
      const newProjectRef = await addDoc(projectsCollectionRef, {
        name: projectFormData.name,
        number: projectFormData.number,
        dateStarted: projectFormData.dateStarted,
        createdAt: new Date(),
      });

      console.log(
        "User data updated and project added with ID: ",
        newProjectRef.id
      );
      setSuccess(true);

      setTimeout(() => {
        router.push(`/${userId}/projects/${newProjectRef.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error saving data: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Project
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Project created successfully! Redirecting...
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-8 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">
            User Information
          </h2>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userFormData.email}
              onChange={handleUserChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={userFormData.name}
              onChange={handleUserChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Number */}
          <div>
            <label
              htmlFor="number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              value={userFormData.number}
              onChange={handleUserChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name *
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={userFormData.projectName}
              onChange={handleUserChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter project name"
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 pt-4">
            Project Details
          </h2>

          {/* Project Name (Details) */}
          <div>
            <label
              htmlFor="projectDetailName"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name *
            </label>
            <input
              type="text"
              id="projectDetailName"
              name="name"
              value={projectFormData.name}
              onChange={handleProjectChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter project name"
            />
          </div>

          {/* Project Number */}
          <div>
            <label
              htmlFor="projectNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Project Number *
            </label>
            <input
              type="text"
              id="projectNumber"
              name="number"
              value={projectFormData.number}
              onChange={handleProjectChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter project number"
            />
          </div>

          {/* Date Started */}
          <div>
            <label
              htmlFor="dateStarted"
              className="block text-sm font-medium text-gray-700"
            >
              Date Started *
            </label>
            <input
              type="date"
              id="dateStarted"
              name="dateStarted"
              value={projectFormData.dateStarted}
              onChange={handleProjectChange}
              required
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
