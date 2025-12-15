"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

interface Room {
  id: string;
  name: string;
  description?: string;
  dimensions?: string;
  images?: Array<{ urls: string }>;
  status?: string;
  startDate?: any;
}

export default function EditRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const projectId = searchParams.get("projectId") as string;
  const userId = params.userId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!projectId || !roomId || !currentUser) {
      if (!projectId) setError("No project ID provided");
      if (!roomId) setError("No room ID provided");
      return;
    }

    const fetchRoom = async () => {
      try {
        const docRef = doc(
          db,
          "users",
          userId,
          "projects",
          projectId,
          "rooms",
          roomId
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const roomData = { id: docSnap.id, ...docSnap.data() } as Room;
          setRoom(roomData);

          const startDate = roomData.startDate
            ? new Date(roomData.startDate.toDate?.() || roomData.startDate)
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0];

          setFormData({
            name: roomData.name || "",
            description: roomData.description || "",
            dimensions: roomData.dimensions || "",
            status: roomData.status || "pending",
            startDate: startDate,
            imageUrls: roomData.images?.map((img) => img.urls) || ["", "", ""],
          });
        } else {
          setError("Room not found");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load room: ${errorMessage}`);
        console.error("Room fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [projectId, roomId, currentUser, userId]);

  const handleFormChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (index: number, file: File | null) => {
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData((prev) => ({ ...prev, imageUrls: newUrls }));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      if (imageFiles[i]) {
        try {
          const file = imageFiles[i]!;
          const storageRef = ref(
            storage,
            `users/${userId}/projects/${projectId}/rooms/${roomId}/image_${i}_${Date.now()}`
          );

          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          uploadedUrls.push(downloadUrl);
        } catch (err) {
          console.error(`Error uploading image ${i}:`, err);
          throw new Error(`Failed to upload image ${i + 1}`);
        }
      } else if (formData.imageUrls[i]) {
        // Keep existing URL if no new file is selected
        uploadedUrls.push(formData.imageUrls[i]);
      }
    }

    return uploadedUrls;
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!projectId || !roomId || !currentUser) {
      alert("Missing required information");
      return;
    }

    setSaving(true);
    setUploadingImages(true);
    try {
      // Upload images if any new files are selected
      let finalImageUrls = formData.imageUrls;

      if (imageFiles.some((f) => f !== null)) {
        finalImageUrls = await uploadImages();
      }

      const roomRef = doc(
        db,
        "users",
        userId,
        "projects",
        projectId,
        "rooms",
        roomId
      );

      const images = finalImageUrls
        .filter((url) => url.trim())
        .map((url) => ({ urls: url }));

      await setDoc(
        roomRef,
        {
          name: formData.name,
          description: formData.description,
          dimensions: formData.dimensions,
          status: formData.status,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          images: images,
        },
        { merge: true }
      );

      alert("Room updated successfully!");
      router.push(
        `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
      );
    } catch (err) {
      console.error("Error saving room:", err);
      alert(err instanceof Error ? err.message : "Failed to update room");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!room) return <div>No room data</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Room</h1>

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
                Images (Upload or enter URLs)
              </label>
              {[0, 1, 2].map((index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Image {index + 1}
                  </p>

                  {formData.imageUrls[index] && (
                    <div className="mb-3">
                      <img
                        src={formData.imageUrls[index]}
                        alt={`Current image ${index + 1}`}
                        className="h-32 w-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Upload new image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFileChange(
                          index,
                          e.target.files?.[0] || null
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Or enter image URL
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrls[index]}
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Image URL ${index + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-8 border-t">
              <button
                type="submit"
                disabled={saving || uploadingImages}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving
                  ? uploadingImages
                    ? "Uploading images..."
                    : "Saving..."
                  : "Update Room"}
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/${userId}/userProjects/projectInfo/roomInfo/roomsList?projectId=${projectId}`
                  )
                }
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
