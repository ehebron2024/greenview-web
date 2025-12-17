"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Room {
  id: string;
  name: string;
  description?: string;
  status?: string;
  dimensions?: string; // e.g., "12x15 ft" or structured; adjust type if needed
  images?: string[]; // array of image URLs
  startDate?: any; // Firestore Timestamp or ISO string
}

export default function RoomInfoPage() {
  const searchParams = useSearchParams();
  const { userId } = useParams() as { userId: string };
  const router = useRouter();
  const projectId = searchParams.get("projectId") as string | null;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!projectId || !currentUser) {
      if (!projectId) setError("No project ID provided");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const roomsRef = collection(
          db,
          "users",
          userId,
          "projects",
          projectId,
          "rooms"
        );
        const snap = await getDocs(roomsRef);
        const list: Room[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setRooms(list);
      } catch (e) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, userId, currentUser]);

  const handleDelete = async (roomId: string) => {
    if (!projectId) return;
    if (!confirm("Delete this room?")) return;
    await deleteDoc(
      doc(db, "users", userId, "projects", projectId, "rooms", roomId)
    );
    setRooms((r) => r.filter((x) => x.id !== roomId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
            <button
              onClick={() =>
                router.push(
                  `/${userId}/userProjects/projectInfo/roomInfo/newRoom?projectId=${projectId}`
                )
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Add Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-gray-600">No rooms added yet.</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const startDate = room.startDate
                  ? (room.startDate.toDate
                      ? room.startDate.toDate()
                      : new Date(room.startDate)
                    ).toLocaleDateString()
                  : null;

                return (
                  <div
                    key={room.id}
                    onClick={() =>
                      router.push(
                        `/${userId}/userProjects/projectInfo/roomInfo/${room.id}?projectId=${projectId}`
                      )
                    }
                    className="flex flex-col gap-3 px-4 py-3 border rounded-lg cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="text-sm text-gray-600">
                            {room.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                          {room.status && (
                            <span>
                              <span className="font-medium">Status:</span>{" "}
                              {room.status}
                            </span>
                          )}
                          {room.dimensions && (
                            <span>
                              <span className="font-medium">Dimensions:</span>{" "}
                              {room.dimensions}
                            </span>
                          )}
                          {startDate && (
                            <span>
                              <span className="font-medium">Start Date:</span>{" "}
                              {startDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/${userId}/userProjects/projectInfo/roomInfo/${room.id}/editRoom?projectId=${projectId}`
                            );
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                          Edit Room
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(room.id);
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {room.images && room.images.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {room.images.slice(0, 4).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${room.name} image ${idx + 1}`}
                            className="h-20 w-28 object-cover rounded border"
                          />
                        ))}
                        {room.images.length > 4 && (
                          <span className="text-xs text-gray-600 self-center">
                            +{room.images.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
