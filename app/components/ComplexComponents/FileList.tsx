"use client";

import React from "react";

interface FileListProps {
  files: any[];
  fileMetadata: Record<string, any>;
  currentFileId: string | null;
  setCurrentFileId: (id: string) => void;
  getMainFileType: (file: any) => string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  fileMetadata,
  currentFileId,
  setCurrentFileId,
  getMainFileType,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border-2 border-black rounded-lg">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => setCurrentFileId(file.original_name)}
          className={`p-2 border-2 rounded-lg cursor-pointer text-sm truncate ${
            currentFileId === file.original_name
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 hover:bg-gray-100"
          } ${
            fileMetadata[file.original_name]?.processingStatus === "completed"
              ? "bg-green-100"
              : fileMetadata[file.original_name]?.processingStatus ===
                "processing"
              ? "bg-yellow-100"
              : fileMetadata[file.original_name]?.processingStatus === "failed"
              ? "bg-red-100"
              : ""
          }`}
        >
          <div className="flex items-center">
            <span>
              {getMainFileType(file) === "image" && "🖼️"}
              {getMainFileType(file) === "video" && "🎬"}
              {getMainFileType(file) === "audio" && "🎵"}
              {getMainFileType(file) === "application" && "📄"}
              {getMainFileType(file) === "unknown" && "📁"}
            </span>
            <span className="ml-1 truncate">{file.original_name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
