import React, { useState, useEffect } from "react";
import {
  Share2,
  Link2,
  Mail,
  Copy,
  Check,
  X,
  Download,
  Users,
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface ShareProjectProps {
  projectId: string;
  projectName: string;
  userId: string;
  onClose?: () => void;
}

const ShareProject: React.FC<ShareProjectProps> = ({
  projectId,
  projectName,
  userId,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [shareMethod, setShareMethod] = useState<"link" | "email" | "team">(
    "link"
  );
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<"view" | "edit">(
    "view"
  );
  const [allowCopy, setAllowCopy] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user.uid : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch project public status
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!currentUser || !userId || !projectId) return;

      try {
        const projectRef = doc(db, "users", userId, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          setIsPublic(projectSnap.data().isPublic || false);
          setAllowCopy(projectSnap.data().allowCopy || false);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };

    fetchProjectData();
  }, [currentUser, userId, projectId]);

  // Generate share link
  const shareLink = `${window.location.origin}/${userId}/userProjects/projectInfo?projectId=${projectId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy link");
    }
  };

  const handleTogglePublic = async () => {
    if (!currentUser || currentUser !== userId) {
      setError("Unauthorized");
      return;
    }

    try {
      const projectRef = doc(db, "users", userId, "projects", projectId);
      await updateDoc(projectRef, {
        isPublic: !isPublic,
        lastUpdated: serverTimestamp(),
      });
      setIsPublic(!isPublic);
    } catch (err) {
      console.error("Error updating public status:", err);
      setError("Failed to update project visibility");
    }
  };

  const handleToggleAllowCopy = async () => {
    if (!currentUser || currentUser !== userId) {
      setError("Unauthorized");
      return;
    }

    try {
      const projectRef = doc(db, "users", userId, "projects", projectId);
      await updateDoc(projectRef, {
        allowCopy: !allowCopy,
        lastUpdated: serverTimestamp(),
      });
      setAllowCopy(!allowCopy);
    } catch (err) {
      console.error("Error updating copy permission:", err);
      setError("Failed to update copy permission");
    }
  };

  const handleEmailShare = async () => {
    if (!email || !currentUser || currentUser !== userId) {
      setError("Invalid email or unauthorized");
      return;
    }

    setEmailSending(true);
    setError(null);

    try {
      // Store share invitation in Firestore
      const shareRef = collection(
        db,
        "users",
        userId,
        "projects",
        projectId,
        "shares"
      );
      await addDoc(shareRef, {
        email,
        message: emailMessage,
        permission: selectedPermission,
        allowCopy: allowCopy,
        sharedBy: currentUser,
        sharedAt: serverTimestamp(),
        status: "pending",
      });

      // Update project with shared users
      const projectRef = doc(db, "users", userId, "projects", projectId);
      await updateDoc(projectRef, {
        sharedWith: arrayUnion({
          email,
          permission: selectedPermission,
          allowCopy: allowCopy,
          sharedAt: new Date().toISOString(),
        }),
        lastUpdated: serverTimestamp(),
      });

      setEmailSending(false);
      setEmailSent(true);

      // Reset form after success
      setTimeout(() => {
        setEmail("");
        setEmailMessage("");
        setEmailSent(false);
      }, 2000);
    } catch (err) {
      console.error("Error sharing project:", err);
      setError("Failed to share project");
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser !== userId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <p className="text-red-600 font-medium mb-4">Unauthorized access</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Project</h2>
              <p className="text-sm text-gray-600">{projectName}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Share Method Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setShareMethod("link")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                shareMethod === "link"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Link</span>
            </button>
            <button
              onClick={() => setShareMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                shareMethod === "email"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === "link" && (
            <div className="space-y-4">
              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Make project public
                  </p>
                  <p className="text-sm text-gray-600">
                    Anyone with the link can view
                  </p>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Allow Copy Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Allow copying to their projects
                  </p>
                  <p className="text-sm text-gray-600">
                    Let others save a copy to their account
                  </p>
                </div>
                <button
                  onClick={handleToggleAllowCopy}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    allowCopy ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      allowCopy ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Copy Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Permission Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Level
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPermission("view")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPermission === "view"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    View Only
                  </button>
                  <button
                    onClick={() => setSelectedPermission("edit")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPermission === "edit"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    Can Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Level
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPermission("view")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPermission === "view"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    View Only
                  </button>
                  <button
                    onClick={() => setSelectedPermission("edit")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPermission === "edit"
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    Can Edit
                  </button>
                </div>
              </div>

              {/* Allow Copy Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="allowCopyEmail"
                  checked={allowCopy}
                  onChange={(e) => setAllowCopy(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="allowCopyEmail"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Allow recipient to copy this project to their account
                </label>
              </div>

              <button
                onClick={handleEmailShare}
                disabled={!email || emailSending}
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  !email || emailSending
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : emailSent
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {emailSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : emailSent ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Invitation Sent!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareProject;
