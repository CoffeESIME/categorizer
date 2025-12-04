// app/components/ComplexComponents/FileList.tsx
"use client";

import React from "react";
import BrutalButton from "../ButtonComponent/ButtonComponent"; // Assuming BrutalButton is in this path

interface FileListProps {
  files: any[];
  fileMetadata: Record<string, any>;
  currentFileId: string | null;
  setCurrentFileId: (id: string) => void;
  getMainFileType: (file: any) => string;
  onDiscardFile: (fileName: string) => void; // New prop
}

export const FileList: React.FC<FileListProps> = ({
  files,
  fileMetadata,
  currentFileId,
  setCurrentFileId,
  getMainFileType,
  onDiscardFile, // New prop
}) => {
  if (!files || files.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No hay archivos seleccionados para procesar.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border-2 border-black rounded-lg">
      {files.map((file) => (
        <div
          key={file.id || file.original_name} // Use a reliable key
          className={`p-2 border-2 rounded-lg text-sm truncate flex flex-col justify-between ${currentFileId === file.original_name
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 hover:bg-gray-100"
            } ${fileMetadata[file.original_name]?.processingStatus === "completed"
              ? "bg-green-100" //
              : fileMetadata[file.original_name]?.processingStatus ===
                "processing"
                ? "bg-yellow-100" //
                : fileMetadata[file.original_name]?.processingStatus === "failed"
                  ? "bg-red-100" //
                  : ""
            }`}
        >
          <div
            onClick={() => setCurrentFileId(file.original_name)}
            className="cursor-pointer flex-grow"
          >
            <div className="flex items-center">
              <span>
                {getMainFileType(file) === "image" && "🖼️"}
                {getMainFileType(file) === "video" && "🎬"}
                {getMainFileType(file) === "audio" && "🎵"}
                {getMainFileType(file) === "application" && "📄"}
                {getMainFileType(file) === "unknown" && "📁"}
              </span>
              <span className="ml-1 truncate font-semibold">
                {file.original_name}
              </span>
              {file.ingestionStatus === "saving" && (
                <svg
                  className="animate-spin ml-2 h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </div>
            <div className="text-xs text-gray-600">
              Status:{" "}
              {fileMetadata[file.original_name]?.processingStatus ||
                "pendiente"}
            </div>
          </div>
          {file.ingestionStatus !== "saving" && (
            <BrutalButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent setCurrentFileId from firing
                onDiscardFile(file.original_name);
              }}
              variant="red"
              className="mt-1 py-1 px-2 text-xs w-full"
            >
              Descartar
            </BrutalButton>
          )}
        </div>
      ))}
    </div>
  );
};
