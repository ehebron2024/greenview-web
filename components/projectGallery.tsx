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
} from "firebase/firestore";
import { User } from "firebase/auth";
import {
  FolderOpen,
  Calendar,
  MapPin,
  DollarSign,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

  // Capitalize first letter of each word, lowercase the rest
  return nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const ProjectGallery: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [projectRooms, setProjectRooms] = useState<{ [key: string]: Room[] }>(
    {}
  );
  const [loadingRooms, setLoadingRooms] = useState<{ [key: string]: boolean }>(
    {}
  );

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

    if (currentUser) {
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
            userProjects.push({ id: doc.id, ...doc.data() } as Project);
          });
          setProjects(userProjects);
          setError(null);
        },
        (firestoreError) => {
          console.error("Error fetching user's projects:", firestoreError);
          setError(`Failed to load projects: ${firestoreError.message}`);
        }
      );
    } else {
      setProjects([]);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser]);

  const handleProjectClick = (projectId: string) => {
    if (currentUser) {
      router.push(
        `/${currentUser.uid}/userProjects/projectInfo?projectId=${projectId}`
      );
    }
  };

  const toggleRooms = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (expandedProject === projectId) {
      setExpandedProject(null);
      return;
    }

    setExpandedProject(projectId);

    // Fetch rooms if not already loaded
    if (!projectRooms[projectId] && currentUser) {
      setLoadingRooms({ ...loadingRooms, [projectId]: true });
      try {
        const roomsRef = collection(
          db,
          "users",
          currentUser.uid,
          "projects",
          projectId,
          "rooms"
        );
        const roomsSnap = await getDocs(roomsRef);
        const rooms: Room[] = [];
        roomsSnap.forEach((doc) => {
          rooms.push({ id: doc.id, ...doc.data() } as Room);
        });
        setProjectRooms({ ...projectRooms, [projectId]: rooms });
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoadingRooms({ ...loadingRooms, [projectId]: false });
      }
    }
  };

  const navigateToRoom = (
    projectId: string,
    roomId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (currentUser) {
      router.push(
        `/${currentUser.uid}/userProjects/projectInfo/roomInfo/${roomId}?projectId=${projectId}`
      );
    }
  };

  const formatDate = (date: any) => {
    if (!date) return null;
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
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
          {userName ? `${userName}'s Projects` : "Projects"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const startDate = formatDate(project.startDate);
            const isExpanded = expandedProject === project.id;
            const rooms = projectRooms[project.id] || [];
            const isLoadingRooms = loadingRooms[project.id];

            return (
              <div
                key={project.id}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div
                  onClick={() => handleProjectClick(project.id)}
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
                          src="/fulllogo.jpg"
                          alt="GreenView Logo"
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    {project.status && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-muted text-gray-700 border-gray-200 backdrop-blur-sm">
                          {project.status.replace("-", " ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
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
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </div>
                      )}

                      {startDate && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{startDate}</span>
                        </div>
                      )}

                      {project.budget !== undefined && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rooms Toggle Button */}
                <button
                  onClick={(e) => toggleRooms(project.id, e)}
                  className="w-full px-5 py-3 bg-muted hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-gray-700 border-t border-gray-200"
                >
                  <span>
                    View{" "}
                    {project.roomCount !== undefined
                      ? `${project.roomCount} `
                      : ""}
                    {project.roomCount === 1 ? "Room" : "Rooms"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Rooms Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-muted p-4">
                    {/* New Room Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentUser) {
                          router.push(
                            `/${currentUser.uid}/userProjects/projectInfo/roomInfo/newRoom?projectId=${project.id}`
                          );
                        }
                      }}
                      className="w-full mb-3 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                    >
                      + New Room
                    </button>

                    {isLoadingRooms ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Loading rooms...
                      </div>
                    ) : rooms.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {rooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={(e) =>
                              navigateToRoom(project.id, room.id, e)
                            }
                            className="bg-card p-3 rounded-lg border border-border hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-foreground text-sm">
                                  {room.name}
                                </p>
                                {room.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {room.description}
                                  </p>
                                )}
                              </div>
                              {room.status && (
                                <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-muted text-gray-600">
                                  {room.status}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No rooms yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-medium">
            No projects found
          </p>
          <p className="text-gray-400 text-sm mt-1">
            You have no projects yet. Start by adding one!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
