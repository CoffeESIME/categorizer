"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      // Preparamos un FormData con el archivo seleccionado
      const formData = new FormData();
      formData.append("file", file);

      // Llamamos a nuestro endpoint /api/upload para subir la imagen a Langflow
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      console.log("File uploaded successfully:", uploadData);

      // Ahora, llamamos al endpoint /api/ocr para procesar la imagen y extraer el texto
      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: uploadData.file_path }),
      });
      const ocrData = await ocrResponse.json();
      setOcrResult(ocrData.message || ocrData.text || JSON.stringify(ocrData));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button
        type="submit"
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {ocrResult && (
        <div className="mt-4 p-4 border">
          <strong>OCR Result:</strong>
          <p>{ocrResult}</p>
        </div>
      )}
    </form>
  );
}
