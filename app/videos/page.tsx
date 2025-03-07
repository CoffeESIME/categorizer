"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { runFlow } from "../utils/langflowAPI";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import BrutalDropDown from "../components/DropDownComponent/DropdownComponent";
import BrutalCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";

interface Metadata {
  author: string;
  description: string;
  date: string;
  title: string;
  tags: string[];
  themes: string[];
  [key: string]: string | string[];
}

export default function VideoUploadMultiStep() {
  // Control de pasos: 1 = subir video, 2 = metadatos, 3 = finalizado
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Estado para el video y la ruta que retorna el backend
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>("");

  // Estados de carga y generación
  const [uploading, setUploading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Estado para metadatos y campos personalizados
  const [metadata, setMetadata] = useState<Metadata>({
    author: "",
    description: "",
    date: "",
    title: "",
    tags: [],
    themes: [],
  });
  const [customFields, setCustomFields] = useState<string[]>([]);

  // Estados locales para inputs de tags y themes (permiten espacios)
  const [tagsInput, setTagsInput] = useState<string>("");
  const [themesInput, setThemesInput] = useState<string>("");

  // Configuración de Dropzone para videos
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
  });

  // ------------------------------
  // Paso 1: Subir Video
  // ------------------------------
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await runFlow({ image_path: "data" });
      const uploadData = await uploadResponse.json();
      console.log("Video subido:", uploadData);
      // Se espera que el endpoint retorne 'file_path'
      setFilePath(uploadData.file_path);
      setStep(2);
    } catch (error) {
      console.error("Error al subir el video:", error);
    } finally {
      setUploading(false);
    }
  };

  // ------------------------------
  // Paso 2: Configurar Metadatos y Generar Descripción
  // ------------------------------
  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomField = () => {
    const fieldName = prompt("Ingrese el nombre del nuevo campo:");
    if (fieldName && !customFields.includes(fieldName)) {
      setCustomFields((prev) => [...prev, fieldName]);
      setMetadata((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Llamada para generar descripción, tags y themes a partir del video
  const handleGenerateDescription = async () => {
    if (!filePath) return;
    setGeneratingDescription(true);
    try {
      const response = await fetch("/api/generateVideoDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_path: filePath }),
      });
      const data = await response.json();
      console.log("Respuesta de descripción:", data);
      setMetadata((prev) => ({
        ...prev,
        description: data.description || "",
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

  // Envío final de metadatos y ruta del video
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const themesArray = themesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const submissionData = {
      videoUrl: filePath,
      ...metadata,
      tags: tagsArray,
      themes: themesArray,
    };
    try {
      const backendResponse = await runFlow({ image_path: "data" });
      if (!backendResponse.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
      console.log("Metadatos del video enviados correctamente");
      setStep(3);
    } catch (error) {
      console.error("Error en el envío final:", error);
    }
  };

  // Reiniciar para subir otro video
  const handleNewVideo = () => {
    setFile(null);
    setFilePath("");
    setMetadata({
      author: "",
      description: "",
      date: "",
      title: "",
      tags: [],
      themes: [],
    });
    setTagsInput("");
    setThemesInput("");
    setCustomFields([]);
    setStep(1);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Send Your Video" variant="neobrutalism" />
      <div className="max-w-xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Paso 1: Subir Video</h2>
            <div
              {...getRootProps()}
              className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
                isDragActive ? "bg-green-300" : "bg-blue-300"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-2xl text-black font-bold">
                  Video seleccionado: {file.name}
                </p>
              ) : (
                <p className="text-lg font-bold">
                  Arrastra y suelta un video, o haz click para seleccionar
                </p>
              )}
            </div>
            <BrutalButton
              onClick={handleUpload}
              disabled={!file || uploading}
              variant="blue"
              className="mt-4"
            >
              {uploading ? "Subiendo..." : "Subir Video"}
            </BrutalButton>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <BrutalButton
                onClick={() => setStep(1)}
                variant="gray"
                className="text-black"
              >
                Volver
              </BrutalButton>
              <h2 className="text-2xl font-bold">
                Paso 2: Metadatos del Video
              </h2>
            </div>
            <p className="mb-2">Video subido en: {filePath}</p>
            <BrutalInput
              type="text"
              name="author"
              value={metadata.author}
              onChange={handleMetadataChange}
              placeholder="Autor"
              className="w-full text-xl mb-2"
            />
            <BrutalInput
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              placeholder="Título del video"
              className="w-full text-xl mb-2"
            />
            <BrutalInput
              type="date"
              name="date"
              value={metadata.date}
              onChange={handleMetadataChange}
              className="w-full text-xl mb-2"
            />
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              placeholder="Descripción (editable)"
              className="w-full p-4 border-4 border-black rounded-lg text-xl bg-orange-300 placeholder-black mb-2"
            />
            <BrutalInput
              type="text"
              name="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (separados por coma, espacios permitidos)"
              className="w-full text-xl mb-2"
            />
            <BrutalInput
              type="text"
              name="themes"
              value={themesInput}
              onChange={(e) => setThemesInput(e.target.value)}
              placeholder="Themes (separados por coma, espacios permitidos)"
              className="w-full text-xl mb-2"
            />

            {customFields.map((field) => (
              <BrutalInput
                key={field}
                type="text"
                name={field}
                value={metadata[field] as string}
                onChange={handleMetadataChange}
                placeholder={field}
                className="w-full text-xl bg-gray-200 mb-2"
              />
            ))}

            <BrutalButton variant="red" onClick={addCustomField}>
              Añadir campo personalizado
            </BrutalButton>
            <div className="flex flex-col space-y-4">
              <BrutalButton
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDescription || !filePath}
                variant="teal"
              >
                {generatingDescription ? "Generando..." : "Generar Descripción"}
              </BrutalButton>
              <BrutalButton type="submit" variant="blue">
                Enviar
              </BrutalButton>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">¡Proceso Finalizado!</h2>
            <p>Los metadatos del video han sido enviados correctamente.</p>
            <BrutalButton variant="green" onClick={handleNewVideo}>
              Subir otro video
            </BrutalButton>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>
    </div>
  );
}
