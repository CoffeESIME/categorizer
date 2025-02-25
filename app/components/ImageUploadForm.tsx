"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Metadata {
  author: string;
  text: string;
  date: string;
  book: string;
  tags: string[];
  themes: string[];
  [key: string]: string | string[];
}

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    author: "",
    text: "",
    date: "",
    book: "",
    tags: [],
    themes: [],
  });
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "tags" | "themes"
  ) => {
    const values = e.target.value.split(",").map((item) => item.trim());
    setMetadata((prev) => ({ ...prev, [field]: values }));
  };

  const addCustomField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName && !customFields.includes(fieldName)) {
      setCustomFields((prev) => [...prev, fieldName]);
      setMetadata((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      // 1. Subir la imagen a través del endpoint /api/upload
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      console.log("File uploaded successfully:", uploadData);

      // 2. Combinar la URL (o file_path) de la imagen con los metadatos
      const submissionData = {
        imageUrl: uploadData.file_path, // Ruta devuelta por Langflow
        ...metadata,
      };

      // 3. Enviar el JSON final al backend a través del endpoint /api/submit
      const backendResponse = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!backendResponse.ok) {
        throw new Error("Failed to submit data to backend");
      }

      console.log("Data submitted successfully");
      // Reiniciar el formulario
      setFile(null);
      setMetadata({
        author: "",
        text: "",
        date: "",
        book: "",
        tags: [],
        themes: [],
      });
      setCustomFields([]);
    } catch (error) {
      console.error("Error uploading file or submitting data:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-6">
      <div
        {...getRootProps()}
        className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
          isDragActive ? "bg-green-300 rotate-1" : "bg-blue-300 -rotate-1"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>File selected: {file.name}</p>
        ) : (
          <p>DRAG 'N' DROP AN IMAGE HERE, OR CLICK TO SELECT</p>
        )}
      </div>

      {["author", "book"].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          value={metadata[field] as string}
          onChange={handleMetadataChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full p-4 border-4 border-black rounded-lg text-xl bg-pink-300 placeholder-black"
        />
      ))}

      <textarea
        name="text"
        value={metadata.text}
        onChange={handleMetadataChange}
        placeholder="Text"
        className="w-full p-4 border-4 border-black rounded-lg text-xl bg-orange-300 placeholder-black"
      />

      <input
        type="date"
        name="date"
        value={metadata.date}
        onChange={handleMetadataChange}
        className="w-full p-4 border-4 border-black rounded-lg text-xl bg-purple-300"
      />

      {["tags", "themes"].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          value={metadata[field].join(", ")}
          onChange={(e) =>
            handleArrayMetadataChange(e, field as "tags" | "themes")
          }
          placeholder={`${
            field.charAt(0).toUpperCase() + field.slice(1)
          } (comma-separated)`}
          className="w-full p-4 border-4 border-black rounded-lg text-xl bg-yellow-300 placeholder-black"
        />
      ))}

      {customFields.map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          value={metadata[field] as string}
          onChange={handleMetadataChange}
          placeholder={field}
          className="w-full p-4 border-4 border-black rounded-lg text-xl bg-green-300 placeholder-black"
        />
      ))}

      <button
        type="button"
        onClick={addCustomField}
        className="bg-red-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black transform rotate-1 hover:rotate-0 transition-transform"
      >
        ADD CUSTOM FIELD
      </button>

      <button
        type="submit"
        disabled={!file || uploading}
        className="bg-blue-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black transform -rotate-1 hover:rotate-0 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {uploading ? "UPLOADING..." : "SUBMIT"}
      </button>
    </form>
  );
}
