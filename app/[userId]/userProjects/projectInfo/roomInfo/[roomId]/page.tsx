"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  name: string;
  status?: string;
  createdAt?: any;
}

interface Comment {
  id: string;
  text: string;
  commentedAt?: any;
  commentedBy: string;
  commenterName?: string;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const projectId = searchParams.get("projectId") as string | null;
  const userId = params.userId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");
  const [addingTask, setAddingTask] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add comment states
  const [commentsByTask, setCommentsByTask] = useState<
    Record<string, Comment[]>
  >({});
  const [showAddComment, setShowAddComment] = useState<Record<string, boolean>>(
    {}
  );
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user.uid);

        // Check if user is admin
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
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

  const fetchTasks = async () => {
    if (!projectId || !roomId || !userId || !currentUser) return;

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

  useEffect(() => {
    fetchTasks();
  }, [projectId, roomId, userId, currentUser]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !projectId || !roomId || !userId) return;

    setAddingTask(true);
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

      await addDoc(tasksRef, {
        name: newTaskName.trim(),
        status: newTaskStatus,
        createdAt: serverTimestamp(),
      });

      setNewTaskName("");
      setNewTaskStatus("pending");
      setShowAddTask(false);
      await fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task");
    } finally {
      setAddingTask(false);
    }
  };

  const fetchComments = async (taskId: string) => {
    if (!projectId || !roomId || !userId || !currentUser) return;

    try {
      const commentsRef = collection(
        db,
        "users",
        userId,
        "projects",
        projectId,
        "rooms",
        roomId,
        "tasks",
        taskId,
        "comments"
      );
      const commentsSnap = await getDocs(commentsRef);
      const commentsList: Comment[] = [];

      commentsSnap.forEach((doc) => {
        commentsList.push({ id: doc.id, ...doc.data() } as Comment);
      });

      setCommentsByTask((prev) => ({ ...prev, [taskId]: commentsList }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // Fetch comments when tasks are loaded
  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach((task) => {
        fetchComments(task.id);
      });
    }
  }, [tasks]);

  const handleAddComment = async (taskId: string) => {
    const commentText = newComment[taskId]?.trim();
    if (!commentText || !projectId || !roomId || !userId || !currentUser)
      return;

    setAddingComment(true);
    try {
      // Get the current user's name from Firestore users collection
      const user = auth.currentUser;
      let userName = "Anonymous";

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userName = userData.name || user.email || "Anonymous";
          } else {
            userName = user.email || "Anonymous";
          }
        } catch (err) {
          console.error("Error fetching user name:", err);
          userName = user.email || "Anonymous";
        }
      }

      const commentsRef = collection(
        db,
        "users",
        userId,
        "projects",
        projectId,
        "rooms",
        roomId,
        "tasks",
        taskId,
        "comments"
      );

      await addDoc(commentsRef, {
        text: commentText,
        commentedBy: currentUser,
        commenterName: userName, // Now fetches from Firestore users/{uid}.name
        commentedAt: serverTimestamp(),
      });

      // Clear the input
      setNewComment((prev) => ({ ...prev, [taskId]: "" }));
      setShowAddComment((prev) => ({ ...prev, [taskId]: false }));

      // Refresh comments
      await fetchComments(taskId);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg">No room data</div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {room.name}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {room.status && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg text-foreground">{room.status}</p>
              </div>
            )}

            {room.dimensions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dimensions
                </p>
                <p className="text-lg text-foreground">{room.dimensions}</p>
              </div>
            )}

            {room.description && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-lg text-foreground">{room.description}</p>
              </div>
            )}

            {room.startDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-lg text-foreground">
                  {formatDate(room.startDate)}
                </p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Images</h2>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <img
                  src={currentImage.urls}
                  alt={`${room.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-[400px] object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      onClick={prevImage}
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={nextImage}
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
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
                          ? "ring-2 ring-primary"
                          : "hover:ring-2 hover:ring-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border pt-8">
            <div className="flex gap-4">
              <Button
                onClick={() =>
                  router.push(
                    `/${userId}/userProjects/projectInfo/roomInfo/${roomId}/editRoom?projectId=${projectId}`
                  )
                }
                variant="forest"
                className="flex-1"
              >
                Edit Room
              </Button>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg border border-border p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
            <Button
              onClick={() => setShowAddTask(!showAddTask)}
              variant={showAddTask ? "secondary" : "forest"}
            >
              {showAddTask ? "Cancel" : "+ Add Task"}
            </Button>
          </div>

          {showAddTask && (
            <form
              onSubmit={handleAddTask}
              className="mb-6 p-4 border border-border rounded-lg bg-muted"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <Button type="submit" disabled={addingTask} variant="forest">
                {addingTask ? "Adding..." : "Add Task"}
              </Button>
            </form>
          )}

          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks added yet.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition bg-card"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {task.name}
                      </h3>
                      {task.createdAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Created: {formatDate(task.createdAt)}
                        </p>
                      )}
                    </div>
                    {task.status && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                        {task.status}
                      </span>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-foreground">
                        Comments ({commentsByTask[task.id]?.length || 0})
                      </h4>
                      <Button
                        onClick={() =>
                          setShowAddComment((prev) => ({
                            ...prev,
                            [task.id]: !prev[task.id],
                          }))
                        }
                        variant="outline"
                        size="sm"
                      >
                        {showAddComment[task.id] ? "Cancel" : "+ Add Comment"}
                      </Button>
                    </div>

                    {/* Add Comment Form */}
                    {showAddComment[task.id] && (
                      <div className="mb-3 p-3 border border-border rounded-md bg-muted">
                        <textarea
                          value={newComment[task.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [task.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a comment..."
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          rows={3}
                        />
                        <Button
                          onClick={() => handleAddComment(task.id)}
                          disabled={
                            addingComment || !newComment[task.id]?.trim()
                          }
                          variant="forest"
                          size="sm"
                          className="mt-2"
                        >
                          {addingComment ? "Adding..." : "Add Comment"}
                        </Button>
                      </div>
                    )}

                    {/* Display Comments */}
                    {commentsByTask[task.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {commentsByTask[task.id].map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 bg-muted rounded-md border border-border"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-semibold text-muted-foreground">
                                {comment.commenterName || "Anonymous"}
                              </p>
                              {comment.commentedAt && (
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(comment.commentedAt)}
                                </p>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No comments yet.
                      </p>
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
