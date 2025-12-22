"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface Room {
  id: string;
  name: string;
  description?: string;
  status?: string;
  dimensions?: string;
  images?: Array<string | { urls: string }>; // Changed from Array<{ urls: string }>
  startDate?: any;
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

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
            <Button
              onClick={() =>
                router.push(
                  `/${userId}/userProjects/projectInfo/roomInfo/newRoom?projectId=${projectId}`
                )
              }
              variant="forest"
            >
              Add Room
            </Button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-muted-foreground">No rooms added yet.</p>
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
                    className="flex flex-col gap-3 px-4 py-3 border border-border rounded-lg cursor-pointer hover:shadow-md hover:border-accent transition bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-foreground">
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="text-sm text-muted-foreground">
                            {room.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/${userId}/userProjects/projectInfo/roomInfo/${room.id}/editRoom?projectId=${projectId}`
                            );
                          }}
                          variant="forest"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(room.id);
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {room.images && room.images.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {room.images.slice(0, 4).map((image, idx) => {
                          const imageUrl =
                            typeof image === "string" ? image : image.urls;

                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              alt={`${room.name} image ${idx + 1}`}
                              className="h-20 w-28 object-cover rounded border border-border"
                            />
                          );
                        })}
                        {room.images.length > 4 && (
                          <span className="text-xs text-muted-foreground self-center px-2">
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
