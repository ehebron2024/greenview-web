"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import SuccessModal from "@/components/SuccessModal";
import { Button } from "@/components/ui/button";

interface UserFormData {
  email: string;
  name: string;
  number: string;
  city: string;
}

interface ProjectFormData {
  name: string;
  contact: string;
  dateStarted: string;
  status: string;
  roomCount: number;
  budget: string;
  description: string;
  location: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;

  const isEditMode = searchParams.get("mode") === "edit";
  const projectId = searchParams.get("projectId");

  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: "",
    name: "",
    number: "",
    city: "",
  });

  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: "",
    contact: "",
    dateStarted: "",
    status: "Planning",
    roomCount: 0,
    budget: "",
    description: "",
    location: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

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

  // Fetch user and project data from Firebase in edit mode
  useEffect(() => {
    if (isEditMode && projectId && user) {
      const fetchData = async () => {
        try {
          // Fetch user data
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserFormData({
              email: userData.email || "",
              name: userData.name || "",
              number: userData.number || "",
              city: userData.city || "",
            });
          }

          // Fetch project data
          const projectRef = doc(db, "users", user.uid, "projects", projectId);
          const projectSnap = await getDoc(projectRef);

          if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            setProjectFormData({
              name: projectData.name || "",
              contact: projectData.contact || "",
              dateStarted: projectData.startDate
                ? new Date(
                    projectData.startDate.toDate?.() || projectData.startDate
                  )
                    .toISOString()
                    .split("T")[0]
                : "",
              status: projectData.status || "Planning",
              roomCount: projectData.roomCount || 0,
              budget: projectData.budget || "",
              description: projectData.description || "",
              location: projectData.location || "",
            });
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load project data"
          );
          console.error("Error fetching data:", err);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    } else if (!isEditMode) {
      setIsLoadingData(false);
    }
  }, [isEditMode, projectId, user]);

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({
      ...prev,
      [name]:
        name === "roomCount" ? (value === "" ? 0 : parseInt(value)) : value,
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

    if (!projectFormData.dateStarted) {
      setError("Please select a start date");
      setIsLoading(false);
      return;
    }

    if (isEditMode && !projectId) {
      setError("Project ID is required for editing");
      setIsLoading(false);
      return;
    }

    try {
      const userDocId = user.uid;
      const now = new Date();

      // Save user data to user document
      const userRef = doc(db, "users", userDocId);
      await setDoc(
        userRef,
        {
          email: userFormData.email,
          name: userFormData.name,
          number: userFormData.number,
          city: userFormData.city,
          createdAt: now,
          lastActivity: now,
        },
        { merge: true }
      );

      // Use projectId in edit mode, otherwise generate a new ID
      const docId = isEditMode ? projectId! : `${userDocId}_${Date.now()}`;
      const projectRef = doc(db, "users", userDocId, "projects", docId);

      const projectData: any = {
        name: projectFormData.name,
        contact: projectFormData.contact,
        status: projectFormData.status,
        startDate: new Date(projectFormData.dateStarted),
        roomCount: projectFormData.roomCount,
        budget: projectFormData.budget,
        description: projectFormData.description,
        location: projectFormData.location,
        lastUpdated: now,
        userId: userDocId, // Add userId to project
      };

      // Only add createdAt for new projects
      if (!isEditMode) {
        projectData.createdAt = now;
      }

      await setDoc(projectRef, projectData, { merge: true });

      console.log(
        `Project ${
          isEditMode ? "updated" : "created"
        } successfully with ID: ${docId}`
      );
      setSuccess(true);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error saving data: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFiles = () => {
    if (projectFormData.name && !isEditMode) {
      // Save project first before going to upload
      setError("Please save the project first before uploading files");
      return;
    }

    const currentProjectId = isEditMode
      ? projectId
      : `${user?.uid}_${Date.now()}`;
    router.push(`/${userId}/projects/${currentProjectId}/uploadFiles`);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push(`/${user?.uid}/userProjects`);
  };

  if (isAuthChecking || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditMode ? "Edit Project" : "Create New Project"}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Project {isEditMode ? "updated" : "created"} successfully!
              Redirecting...
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-8 space-y-6"
          >
            {/* ...existing form fields... */}
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

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={userFormData.city}
                onChange={handleUserChange}
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your city"
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

            {/* Project Contact */}
            <div>
              <label
                htmlFor="projectContact"
                className="block text-sm font-medium text-gray-700"
              >
                Project Contact *
              </label>
              <input
                type="text"
                id="projectContact"
                name="contact"
                value={projectFormData.contact}
                onChange={handleProjectChange}
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project contact"
              />
            </div>

            {/* Project Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={projectFormData.location}
                onChange={handleProjectChange}
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project location/address"
              />
            </div>

            {/* Project Budget */}
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700"
              >
                Budget *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={projectFormData.budget}
                onChange={handleProjectChange}
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project budget"
              />
            </div>

            {/* Project Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={projectFormData.description}
                onChange={handleProjectChange}
                required
                rows={4}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project description"
              />
            </div>

            {/* Project Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={projectFormData.status}
                onChange={handleProjectChange}
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
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

            {/* Number of Rooms */}
            <div>
              <label
                htmlFor="roomCount"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Rooms *
              </label>
              <input
                type="number"
                id="roomCount"
                name="roomCount"
                value={projectFormData.roomCount || ""}
                onChange={handleProjectChange}
                required
                min="0"
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter number of rooms"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                variant="forest"
                className="flex-1"
              >
                {isLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Project"
                  : "Create Project"}
              </Button>

              <Button
                type="button"
                onClick={() => router.back()}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {/* Upload Files Button - Only show after project is created/edited */}
            {isEditMode && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleUploadFiles}
                  variant="forest"
                  className="w-full"
                >
                  Upload Project Files
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
    </>
  );
}
