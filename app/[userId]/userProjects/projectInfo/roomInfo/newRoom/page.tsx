"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, setDoc, doc, Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface RoomFormData {
  name: string;
  description: string;
  dimensions: string;
  status: string;
  startDate: string;
  imageUrls: string[];
}

export default function NewRoomPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const userId = params.userId as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    dimensions: "",
    status: "pending",
    startDate: new Date().toISOString().split("T")[0],
    imageUrls: ["", "", ""],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setError("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFormChange = (
    field: keyof RoomFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData((prev) => ({ ...prev, imageUrls: newUrls }));
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!projectId || !currentUser) {
      alert("Missing project ID or user authentication");
      return;
    }

    setLoading(true);
    try {
      // Generate a simple, unique roomId
      const roomId = `room_${Date.now()}`;
      const roomRef = doc(
        db,
        "users",
        userId,
        "projects",
        projectId,
        "rooms",
        roomId
      );

      const images = formData.imageUrls
        .filter((url) => url.trim())
        .map((url) => ({ urls: url }));

      await setDoc(roomRef, {
        name: formData.name,
        description: formData.description,
        dimensions: formData.dimensions,
        status: formData.status,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        images: images,
      });

      alert("Room created successfully!");
      router.push(
        `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
      );
    } catch (err) {
      console.error("Error saving room:", err);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Room
          </h1>

          <form onSubmit={handleSaveRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Kitchen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Everything new"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => handleFormChange("dimensions", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10x12 feet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="demolition">Demolition</option>
                <option value="construction">Construction</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleFormChange("startDate", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Image URLs
              </label>
              {formData.imageUrls.map((url, index) => (
                <input
                  key={index}
                  type="text"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder={`Image URL ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-4 pt-8 border-t">
              <
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Room"}
              </>
              <
                type=""
                onClick={() =>
                  router.push(
                    `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
                  )
                }
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
