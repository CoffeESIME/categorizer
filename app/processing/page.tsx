"use client";

import React, { useState, useEffect } from "react";
import { useFileStore } from "../store/filestore";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import categorizerAPI from "../utils/categorizerAPI";
import { FileList } from "../components/ComplexComponents/FileList";
import { FilePreview } from "../components/ComplexComponents/FilePreview";
import { ProcessOptions } from "../components/ComplexComponents/ProcessOptions";
import { MetadataForm } from "../components/ComplexComponents/MetadataForm";

export type FileMetadata = {
  id: string;
  author?: string;
  title?: string;
  description?: string;
  tags: string[];
  sourceType?: string;
  extractedText?: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  processingMethod?: "manual" | "llm" | "ocr";
};

export default function ProcessFiles() {
  const { getSelectedFiles } = useFileStore();
  const [files, setFiles] = useState(getSelectedFiles());
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, FileMetadata>
  >({});
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  const [autoFields, setAutoFields] = useState({
    author: false,
    title: false,
    description: false,
    tags: false,
  });

  const [llmConfig, setLlmConfig] = useState({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 2000,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Opciones de modelos para el dropdown
  const llmModelOptions = [
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
    { label: "GPT-4", value: "gpt-4" },
    { label: "Davinci", value: "text-davinci-003" },
  ];

  useEffect(() => {
    const initialMetadata: Record<string, FileMetadata> = {};
    files.forEach((file) => {
      initialMetadata[file.original_name] = {
        id: file.original_name,
        tags: [],
        processingStatus: "pending",
      };
    });
    setFileMetadata(initialMetadata);
    if (files.length > 0) {
      setCurrentFileId(files[0].original_name);
    }
  }, [files]);

  const getCurrentFile = () => {
    return currentFileId
      ? files.find((f) => f.original_name === currentFileId)
      : null;
  };

  const getCurrentFileMetadata = () => {
    return currentFileId ? fileMetadata[currentFileId] : null;
  };

  const getMainFileType = (file: any) => {
    return file?.file_type?.split("/")[0] || "unknown";
  };

  const getProcessingOptions = (file: any) => {
    const mainType = getMainFileType(file);
    switch (mainType) {
      case "image":
        return ["ocr", "llm", "manual"];
      case "video":
      case "audio":
        return ["llm", "manual"];
      case "application":
        if (file.file_type.includes("json") || file.file_type.includes("pdf")) {
          return ["llm", "manual"];
        }
        return ["manual"];
      default:
        return ["manual"];
    }
  };

  const updateCurrentFileMetadata = (updates: Partial<FileMetadata>) => {
    if (!currentFileId) return;
    setFileMetadata((prev) => ({
      ...prev,
      [currentFileId]: {
        ...prev[currentFileId],
        ...updates,
      },
    }));
  };

  const processWithLLM = async () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: "llm",
    });

    try {
      const result = await categorizerAPI.processFileWithLLM(
        currentFile.file_url!,
        {
          extractAuthor: autoFields.author,
          extractTitle: autoFields.title,
          extractDescription: autoFields.description,
          extractTags: autoFields.tags,
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          maxTokens: llmConfig.maxTokens,
        }
      );

      updateCurrentFileMetadata({
        author: result.author,
        title: result.title,
        description: result.description,
        tags: result.tags || [],
        extractedText: result.extractedText,
        processingStatus: "completed",
      });
    } catch (error) {
      console.error("Error LLM:", error);
      updateCurrentFileMetadata({ processingStatus: "failed" });
      alert("Ocurrió un error al procesar el archivo con LLM.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithOCR = async () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: "ocr",
    });

    try {
      const result = await categorizerAPI.processImageWithOCR(
        currentFile.file_url!
      );

      updateCurrentFileMetadata({
        extractedText: result.text,
        processingStatus: "completed",
      });
    } catch (error) {
      console.error("Error OCR:", error);
      updateCurrentFileMetadata({ processingStatus: "failed" });
      alert("Ocurrió un error al procesar la imagen con OCR.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAllMetadata = async () => {
    setIsProcessing(true);
    try {
      const allMetadata = Object.values(fileMetadata);
      await categorizerAPI.saveFilesMetadata(allMetadata);
      alert("Metadatos guardados correctamente!");
    } catch (error) {
      console.error("Error al guardar metadatos:", error);
      alert("Error guardando metadatos. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAutoField = (field: string) => {
    setAutoFields((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const addTag = (tag: string) => {
    if (!currentFileId || !tag.trim()) return;
    setFileMetadata((prev) => {
      const currentTags = prev[currentFileId].tags || [];
      if (!currentTags.includes(tag.trim())) {
        return {
          ...prev,
          [currentFileId]: {
            ...prev[currentFileId],
            tags: [...currentTags, tag.trim()],
          },
        };
      }
      return prev;
    });
  };

  const removeTag = (tag: string) => {
    if (!currentFileId) return;
    setFileMetadata((prev) => {
      const currentTags = prev[currentFileId].tags || [];
      return {
        ...prev,
        [currentFileId]: {
          ...prev[currentFileId],
          tags: currentTags.filter((t) => t !== tag),
        },
      };
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col bg-yellow-100">
      <TitleComponent title="Procesar Archivos" variant="neobrutalism" />

      <div className="max-w-6xl mx-auto w-full">
        <div className="p-4 border-4 border-black bg-white rounded-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Procesando {files.length} archivos
            </h2>
            <p>
              Extrae metadatos de tus archivos automáticamente o de forma manual
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">
              Selecciona un archivo para procesar:
            </h3>
            <FileList
              files={files}
              fileMetadata={fileMetadata}
              currentFileId={currentFileId}
              setCurrentFileId={setCurrentFileId}
              getMainFileType={getMainFileType}
            />
          </div>

          {currentFileId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Vista previa</h3>
                <FilePreview
                  file={getCurrentFile()}
                  getMainFileType={getMainFileType}
                />
                <ProcessOptions
                  currentFile={getCurrentFile()}
                  isProcessing={isProcessing}
                  processWithOCR={processWithOCR}
                  processWithLLM={processWithLLM}
                  autoFields={autoFields}
                  toggleAutoField={toggleAutoField}
                  llmConfig={llmConfig}
                  setLlmConfig={setLlmConfig}
                  llmModelOptions={llmModelOptions}
                  getProcessingOptions={getProcessingOptions}
                />
              </div>
              <div>
                <MetadataForm
                  metadata={getCurrentFileMetadata()}
                  autoFields={autoFields}
                  toggleAutoField={toggleAutoField}
                  updateMetadata={updateCurrentFileMetadata}
                  addTag={addTag}
                  removeTag={removeTag}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <ButtonLink href="/pending" variant="outline" size="lg">
              <p className="text-xl">Volver</p>
            </ButtonLink>
            <BrutalButton
              onClick={saveAllMetadata}
              disabled={isProcessing || files.length === 0}
              variant="green"
            >
              {isProcessing ? "Guardando..." : "Guardar metadatos"}
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
