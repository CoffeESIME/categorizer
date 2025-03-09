"use client";

import React from "react";

interface FilePreviewProps {
  file: any;
  getMainFileType: (file: any) => string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  getMainFileType,
}) => {
  if (!file) return null;
  const mainType = getMainFileType(file);
  const fileURL = `${process.env.NEXT_PUBLIC_CATEGORIZER_URL}${file.file_url}`;

  if (mainType === "image") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <img
          src={fileURL}
          alt={file.original_name}
          className="max-w-[80%] mx-auto object-contain"
        />
      </div>
    );
  } else if (mainType === "video") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <video controls className="max-h-64 max-w-full mx-auto">
          <source src={fileURL} type={file.file_type} />
          Tu navegador no soporta este video.
        </video>
      </div>
    );
  } else if (mainType === "audio") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <audio controls className="w-full">
          <source src={fileURL} type={file.file_type} />
          Tu navegador no soporta este audio.
        </audio>
      </div>
    );
  } else {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100 flex items-center justify-center">
        <p className="text-center">
          <span className="text-3xl">📄</span>
          <br />
          {file.original_name}
        </p>
      </div>
    );
  }
};
