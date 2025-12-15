"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Task {
  id: string;
  name: string;
  status?: string;
  createdAt?: any;
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

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const projectId = params.projectId as string;
  const userId = params.userId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  useEffect(() => {
    if (!projectId || !roomId || !userId || !currentUser) return;

    const fetchTasks = async () => {
      try {
        const tasksRef = collection(
          db,
          "users",
          userId,
          "projects",
          projectId,
          "rooms",
          roomId,
          "tasks"
        );
        const tasksSnap = await getDocs(tasksRef);
        const tasksList: Task[] = [];

        tasksSnap.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() } as Task);
        });

        setTasks(tasksList);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, [projectId, roomId, userId, currentUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!room) return <div>No room data</div>;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const images = room.images || [];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{room.name}</h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {room.status && (
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg text-gray-900">{room.status}</p>
              </div>
            )}

            {room.dimensions && (
              <div>
                <p className="text-sm font-medium text-gray-600">Dimensions</p>
                <p className="text-lg text-gray-900">{room.dimensions}</p>
              </div>
            )}

            {room.description && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-lg text-gray-900">{room.description}</p>
              </div>
            )}

            {room.startDate && (
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-lg text-gray-900">
                  {formatDate(room.startDate)}
                </p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
              <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={currentImage.urls}
                  alt={`${room.name} - Image ${currentImageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image.urls}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 w-20 object-cover rounded cursor-pointer transition ${
                        index === currentImageIndex
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-8">
            <button
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h2>

          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks added yet.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:shadow transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {task.name}
                      </h3>
                      {task.createdAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {formatDate(task.createdAt)}
                        </p>
                      )}
                    </div>
                    {task.status && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {task.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
