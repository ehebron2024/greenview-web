"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  accept?: string;
  maxFiles?: number;
}

export default function FileUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  accept = "image/*",
  maxFiles = 10,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxFiles,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-background hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-foreground font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted px-4 py-3 rounded-md border border-border"
            >
              <span className="text-sm text-foreground truncate flex-1">
                {file.name}
              </span>
              <Button
                onClick={() => onRemoveFile(index)}
                variant="ghost"
                size="icon-sm"
                className="ml-2 hover:text-destructive"
              ></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
