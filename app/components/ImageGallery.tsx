"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageData {
  id: string;
  url: string;
  author?: string;
  text?: string;
  date?: string;
  book?: string;
  tags?: string[];
  themes?: string[];
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/images");
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      const data = await response.json();
      // Ensure that data is an array
      if (Array.isArray(data)) {
        setImages(data);
      } else {
        console.error("Received data is not an array:", data);
        setError("Received invalid data format");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-2xl font-bold text-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-2xl font-bold text-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-2xl font-bold text-center p-4">No images found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-white border-4 border-black p-4 rounded-lg transform rotate-1 hover:rotate-0 transition-transform"
        >
          <div className="relative aspect-square mb-4">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.text || "Image"}
              fill
              className="object-cover rounded-lg border-4 border-black"
            />
          </div>
          {image.author && (
            <h3 className="text-2xl font-bold mb-2">{image.author}</h3>
          )}
          {image.text && <p className="text-lg mb-2">{image.text}</p>}
          {image.book && <p className="text-md mb-2">Book: {image.book}</p>}
          {image.date && <p className="text-md mb-2">Date: {image.date}</p>}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {image.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-yellow-300 px-2 py-1 rounded-full text-sm border-2 border-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {image.themes && image.themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.themes.map((theme, index) => (
                <span
                  key={index}
                  className="bg-green-300 px-2 py-1 rounded-full text-sm border-2 border-black"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
