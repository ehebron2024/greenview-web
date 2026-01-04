"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  DocumentData,
  doc,
  getDoc,
  getDocs,
  collectionGroup,
  query,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combo-box";
import { useAdmin } from "@/hooks/useAdmin";

interface Project extends DocumentData {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  status?: string;
  startDate?: any;
  budget?: number;
  roomCount?: number;
  contact?: string;
  createdAt?: any;
  lastUpdated?: any;
  userId?: string;
}

interface Room {
  id: string;
  name: string;
  status?: string;
  description?: string;
}

function getCapitalizedNameFromEmail(email: string | null): string {
  if (!email) return "User";
  const namePart = email.split("@")[0];
  const nameParts = namePart.split(/[._-]/);

  return nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [roomsByProject, setRoomsByProject] = useState<Record<string, Room[]>>(
    {}
  );
  const [loadingRooms, setLoadingRooms] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchUserName = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const email = userSnap.data().email || currentUser.email || "";
            setUserName(getCapitalizedNameFromEmail(email));
          } else {
            setUserName(getCapitalizedNameFromEmail(currentUser.email));
          }
        } catch (err) {
          console.error("Error fetching user name:", err);
          setUserName(getCapitalizedNameFromEmail(currentUser.email));
        }
      };

      fetchUserName();
    }
  }, [currentUser]);

  useEffect(() => {
    let unsubscribeFirestore: () => void;

    if (currentUser && !adminLoading) {
      if (isAdmin) {
        // Admin: Use collectionGroup to fetch ALL projects
        const fetchAllProjects = async () => {
          try {
            console.log(
              "🔑 Admin mode: Fetching all projects using collectionGroup"
            );

            const projectsQuery = query(collectionGroup(db, "projects"));
            const projectsSnapshot = await getDocs(projectsQuery);
            const allProjects: Project[] = [];

            projectsSnapshot.forEach((doc) => {
              // Extract userId from document path: users/{userId}/projects/{projectId}
              const pathParts = doc.ref.path.split("/");
              const userIdFromPath = pathParts[1];

              allProjects.push({
                id: doc.id,
                userId: userIdFromPath,
                ...doc.data(),
              } as Project);
            });

            console.log(
              `✅ Fetched ${allProjects.length} projects from all users`
            );
            setProjects(allProjects);
            setError("");
          } catch (err) {
            console.error("Error fetching all projects:", err);
            setError("Failed to load projects");
          }
        };

        fetchAllProjects();
      } else {
        // Regular user: Only their projects with real-time updates
        const userProjectsCollectionRef = collection(
          db,
          "users",
          currentUser.uid,
          "projects"
        );

        unsubscribeFirestore = onSnapshot(
          userProjectsCollectionRef,
          (querySnapshot) => {
            const userProjects: Project[] = [];
            querySnapshot.forEach((doc) => {
              userProjects.push({
                id: doc.id,
                userId: currentUser.uid,
                ...doc.data(),
              } as Project);
            });
            setProjects(userProjects);
            setError("");
          },
          (firestoreError) => {
            console.error("Error fetching user's projects:", firestoreError);
            setError(`Failed to load projects: ${firestoreError.message}`);
          }
        );
      }
    } else {
      setProjects([]);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser, isAdmin, adminLoading]);

  const handleProjectClick = (projectId: string, projectUserId: string) => {
    if (currentUser) {
      router.push(
        `/${projectUserId}/userProjects/projectInfo?projectId=${projectId}`
      );
    }
  };

  const fetchRoomsForProject = async (
    projectId: string,
    projectUserId: string
  ) => {
    if (!currentUser) return;

    setLoadingRooms((prev) => ({ ...prev, [projectId]: true }));

    try {
      const roomsRef = collection(
        db,
        "users",
        projectUserId,
        "projects",
        projectId,
        "rooms"
      );
      const roomsSnapshot = await getDocs(roomsRef);

      const roomsData = roomsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Untitled Room",
        description: doc.data().description,
        status: doc.data().status,
      })) as Room[];

      setRoomsByProject((prev) => ({ ...prev, [projectId]: roomsData }));
    } catch (error) {
      console.error(`Error fetching rooms for project ${projectId}:`, error);
    } finally {
      setLoadingRooms((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  useEffect(() => {
    if (projects.length > 0 && currentUser) {
      projects.forEach((project) => {
        fetchRoomsForProject(project.id, project.userId || currentUser.uid);
      });
    }
  }, [projects, currentUser]);

  const formatDate = (date: any) => {
    if (!date) return null;
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || adminLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-lg">
            Please sign in to view your projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {isAdmin
            ? "All Projects (Admin)"
            : userName
            ? `${userName}'s Projects`
            : "Projects"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {isAdmin && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          🔑 Admin Mode: Viewing all user projects
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const startDate = formatDate(project.startDate);
            const rooms = roomsByProject[project.id] || [];
            const isLoadingRooms = loadingRooms[project.id] || false;
            const projectUserId = project.userId || currentUser.uid;

            return (
              <div
                key={project.id}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div
                  onClick={() => handleProjectClick(project.id, projectUserId)}
                  className="cursor-pointer"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src="/print_transparent.svg"
                          alt="GreenView Logo"
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    {project.status && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-muted text-foreground border-border backdrop-blur-sm">
                          {project.status.replace("-", " ")}
                        </span>
                      </div>
                    )}

                    {/* Admin Owner Badge */}
                    {isAdmin && projectUserId !== currentUser.uid && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 border border-amber-300 text-amber-800">
                          Owner: {projectUserId.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Project Details */}
                    <div className="space-y-2">
                      {project.location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <span className="truncate">{project.location}</span>
                        </div>
                      )}

                      {startDate && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <span>{startDate}</span>
                        </div>
                      )}

                      {project.budget !== undefined && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ComboBox Component */}
                <div className="border-t border-border bg-muted/50 p-4">
                  {isLoadingRooms ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Loading rooms...
                    </div>
                  ) : (
                    <>
                      <Combobox
                        items={rooms.map((room) => ({
                          label: room.name,
                          value: room.id,
                        }))}
                        onSelect={(selected) => {
                          router.push(
                            `/${projectUserId}/userProjects/projectInfo/roomInfo/${selected.value}?projectId=${project.id}`
                          );
                        }}
                        placeholder={
                          rooms.length > 0 ? "Select a room..." : "No rooms yet"
                        }
                        emptyText={
                          project.roomCount && project.roomCount > 0
                            ? `Project has ${project.roomCount} ${
                                project.roomCount === 1 ? "room" : "rooms"
                              } planned. Add rooms to view them here.`
                            : "No rooms found"
                        }
                        className="w-full mb-3"
                      />

                      {/* Show room count info */}
                      <p className="text-xs text-muted-foreground text-center mb-2">
                        {rooms.length > 0 ? (
                          <>
                            {rooms.length}{" "}
                            {rooms.length === 1 ? "room" : "rooms"} created
                            {project.roomCount &&
                              project.roomCount > rooms.length && (
                                <>
                                  {" "}
                                  • {project.roomCount - rooms.length} more
                                  planned
                                </>
                              )}
                          </>
                        ) : project.roomCount && project.roomCount > 0 ? (
                          <>
                            {project.roomCount}{" "}
                            {project.roomCount === 1 ? "room" : "rooms"} planned
                          </>
                        ) : (
                          "No rooms yet"
                        )}
                      </p>
                    </>
                  )}

                  {/* New Room Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/${projectUserId}/userProjects/projectInfo/roomInfo/newRoom?projectId=${project.id}`
                      );
                    }}
                    variant="forest"
                    size="lg"
                    className="w-full"
                  >
                    + Add New Room
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "No projects found in the system."
              : "You have no projects yet. Start by adding one!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
