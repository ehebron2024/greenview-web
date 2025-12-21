"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadFilesPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const projectId = params.projectId as string;

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    setUploading(true);
    // Add file upload logic here (Firebase Storage, etc.)
    console.log("Uploading files:", files);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Upload Project Files
        </h1>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {files.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Selected Files:</h2>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="text-gray-700">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              variant="forest"
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload Files"}
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
    </div>
  );
}
