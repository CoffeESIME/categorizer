"use client";
import React from "react";

interface Hit {
  id: string;
  distance: number;
  file_location?: string;
  text_chunk?: string;
  original_doc_id?: string;
  page_number?: number;
  chunk_sequence?: number;
  [k: string]: any;
}

interface SearchResultPreviewProps {
  hit: Hit;
}

const getFileTypeFromName = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if ("jpg jpeg png gif bmp webp".split(" ").includes(ext)) return "image";
  if ("mp4 webm ogv mov".split(" ").includes(ext)) return "video";
  if ("mp3 wav ogg".split(" ").includes(ext)) return "audio";
  if ("pdf".split(" ").includes(ext)) return "pdf";
  if ("txt md json".split(" ").includes(ext)) return "text";
  return "other";
};

export const SearchResultPreview: React.FC<SearchResultPreviewProps> = ({ hit }) => {
  const fileUrl = hit.file_location
    ? `${process.env.NEXT_PUBLIC_CATEGORIZER_URL}/uploads/${hit.file_location}`
    : undefined;
  const fileName = hit.file_location?.split("/").pop() ?? hit.original_doc_id ?? "";
  const type = fileUrl ? getFileTypeFromName(fileName) : hit.text_chunk ? "text" : "other";

  if (type === "image" && fileUrl) {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <img src={fileUrl} alt={fileName} className="max-w-[80%] mx-auto object-contain" />
      </div>
    );
  }
  if (type === "video" && fileUrl) {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <video controls className="max-h-64 max-w-full mx-auto">
          <source src={fileUrl} />
          Tu navegador no soporta este video.
        </video>
      </div>
    );
  }
  if (type === "audio" && fileUrl) {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <audio controls className="w-full">
          <source src={fileUrl} />
          Tu navegador no soporta este audio.
        </audio>
      </div>
    );
  }
  if (hit.text_chunk) {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100 text-sm whitespace-pre-wrap">
        {hit.text_chunk}
      </div>
    );
  }
  if (fileUrl) {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100 text-center">
        <a href={fileUrl} target="_blank" className="underline break-all">
          {fileName}
        </a>
      </div>
    );
  }
  return null;
};

export default SearchResultPreview;
