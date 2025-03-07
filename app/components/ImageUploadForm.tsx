"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Metadata {
  author: string;
  description: string;
  date: string;
  book: string;
  tags: string[];
  themes: string[];
  [key: string]: string | string[];
}

export default function ImageUploadMultiStep() {
  // Estado para controlar el paso actual (1: subir imagen, 2: metadatos, 3: final)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Estados para la imagen y la ruta que regresa el backend
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>("");

  // Estados para el proceso de subida y de generación de descripción
  const [uploading, setUploading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Estado para metadatos y campos personalizados
  const [metadata, setMetadata] = useState<Metadata>({
    author: "",
    description: "",
    date: "",
    book: "",
    tags: [],
    themes: [],
  });
  const [customFields, setCustomFields] = useState<string[]>([]);

  // Estados locales para inputs de tags y themes (para permitir espacios)
  const [tagsInput, setTagsInput] = useState<string>("");
  const [themesInput, setThemesInput] = useState<string>("");

  // Configuración de Dropzone para la imagen
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // ---------------------------
  // Paso 1: Subir Imagen
  // ---------------------------
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      console.log("Imagen subida:", uploadData);
      // Se espera que el endpoint retorne un campo 'file_path'
      setFilePath(uploadData.file_path);
      // Avanzar al siguiente paso
      setStep(2);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------
  // Paso 2: Configurar Metadatos y Generar Descripción
  // ---------------------------
  // Actualiza los campos de metadatos simples
  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  // Agrega un campo personalizado
  const addCustomField = () => {
    const fieldName = prompt("Ingrese el nombre del nuevo campo:");
    if (fieldName && !customFields.includes(fieldName)) {
      setCustomFields((prev) => [...prev, fieldName]);
      setMetadata((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Llama al endpoint para generar descripción, tags y themes opcionales
  const handleGenerateDescription = async () => {
    if (!filePath) return;
    setGeneratingDescription(true);
    try {
      // Se envía la ruta de la imagen al endpoint que procesa la imagen
      const response = await fetch("/api/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_path: filePath }),
      });
      const data = await response.json();
      console.log("Respuesta de generación:", data);
      setMetadata((prev) => ({
        ...prev,
        description: data.description || "",
        // Opcional: tags y themes retornados por el modelo
        tags: data.tags || [],
        themes: data.themes || [],
      }));
      setTagsInput(data.tags ? data.tags.join(", ") : "");
      setThemesInput(data.themes ? data.themes.join(", ") : "");
    } catch (error) {
      console.error("Error al generar la descripción:", error);
    } finally {
      setGeneratingDescription(false);
    }
  };

  // Maneja el envío final de los metadatos y la imagen al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convierte los inputs de tags y themes a arrays
    const tagsArray = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const themesArray = themesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const submissionData = {
      imageUrl: filePath,
      ...metadata,
      tags: tagsArray,
      themes: themesArray,
    };
    try {
      const backendResponse = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (!backendResponse.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
      console.log("Datos enviados correctamente");
      setStep(3);
    } catch (error) {
      console.error("Error en el envío final:", error);
    }
  };

  // ---------------------------
  // Paso 3: Final - Proceso Completado
  // ---------------------------
  const handleNewImage = () => {
    // Reiniciar todos los estados para un nuevo proceso
    setFile(null);
    setFilePath("");
    setMetadata({
      author: "",
      description: "",
      date: "",
      book: "",
      tags: [],
      themes: [],
    });
    setTagsInput("");
    setThemesInput("");
    setCustomFields([]);
    setStep(1);
  };

  return (
    <div className="max-w-xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6">
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Paso 1: Subir Imagen</h2>
          <div
            {...getRootProps()}
            className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
              isDragActive ? "bg-green-300" : "bg-blue-300"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p>Imagen seleccionada: {file.name}</p>
            ) : (
              <p>Arrastra y suelta una imagen, o haz click para seleccionar</p>
            )}
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 bg-blue-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black hover:rotate-1 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? "Subiendo..." : "Subir Imagen"}
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg"
            >
              Volver
            </button>
            <h2 className="text-2xl font-bold">Paso 2: Metadatos</h2>
          </div>
          <p className="mb-2">Imagen subida en: {filePath}</p>
          {/* Campos de metadatos */}
          <input
            type="text"
            name="author"
            value={metadata.author}
            onChange={handleMetadataChange}
            placeholder="Autor"
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-pink-300 placeholder-black"
          />
          <input
            type="text"
            name="book"
            value={metadata.book}
            onChange={handleMetadataChange}
            placeholder="Libro"
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-pink-300 placeholder-black"
          />
          <input
            type="date"
            name="date"
            value={metadata.date}
            onChange={handleMetadataChange}
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-purple-300"
          />
          <textarea
            name="description"
            value={metadata.description}
            onChange={handleMetadataChange}
            placeholder="Descripción (editable)"
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-orange-300 placeholder-black"
          />
          <input
            type="text"
            name="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (separados por coma, espacios permitidos)"
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-yellow-300 placeholder-black"
          />
          <input
            type="text"
            name="themes"
            value={themesInput}
            onChange={(e) => setThemesInput(e.target.value)}
            placeholder="Themes (separados por coma, espacios permitidos)"
            className="w-full p-4 border-4 border-black rounded-lg text-xl bg-yellow-300 placeholder-black"
          />

          {/* Campos personalizados */}
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
            className="bg-red-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black hover:rotate-1 transition-transform"
          >
            Añadir campo personalizado
          </button>

          {/* Botón para generar descripción mediante el modelo multimodal */}
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generatingDescription || !filePath}
            className="bg-indigo-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black hover:rotate-1 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generatingDescription ? "Generando..." : "Generar Descripción"}
          </button>

          {/* Botón para enviar los datos finales */}
          <button
            type="submit"
            disabled={uploading || generatingDescription || !filePath}
            className="bg-blue-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black hover:rotate-1 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">¡Proceso Finalizado!</h2>
          <p>Los datos han sido enviados correctamente.</p>
          <button
            type="button"
            onClick={handleNewImage}
            className="bg-green-400 text-black px-6 py-4 rounded-lg text-xl border-4 border-black hover:rotate-1 transition-transform"
          >
            Subir otra imagen
          </button>
        </div>
      )}
    </div>
  );
}
