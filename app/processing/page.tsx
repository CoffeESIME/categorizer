"use client";
import React, { useState, useEffect } from "react";
import { useFileStore } from "../store/filestore";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import categorizerAPI, {
  OCRMethod,
  ProcessingMethod,
  TaskType,
} from "../utils/categorizerAPI";
import { FileList } from "../components/ComplexComponents/FileList";
import { FilePreview } from "../components/ComplexComponents/FilePreview";
import { ProcessOptions } from "../components/ComplexComponents/ProcessOptions";
import { MetadataForm } from "../components/ComplexComponents/MetadataForm";
import { useConfigStore } from "../store/configStore";
import { useRouter } from "next/navigation";

export type FileMetadata = {
  id: string;
  author?: string;
  title?: string;
  content?: string;
  tags: string[];
  sourceType?: string;
  extractedText?: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  processingMethod?: ProcessingMethod;
  llmErrorResponse?: string;
  work?: string;
  languages?: string[];
  sentiment_word?: string;
  sentiment_value?: number;
  analysis?: string;
  categories?: string[];
  keywords?: string[];
  content_type?: string;
  multilingual?: boolean;
  description?: string;
  topics?: string[];
  style?: string;
  color_palette?: string[];
  composition?: string;
  file_type?: string;
};

interface AutoFields {
  [key: string]: boolean;
  author: boolean;
  title: boolean;
  content: boolean;
  tags: boolean;
  sentiment: boolean;
  description: boolean;
  topics: boolean;
  style: boolean;
  color_palette: boolean;
  composition: boolean;
}

export default function ProcessFiles() {
  const { getSelectedFiles } = useFileStore();
  const [files, setFiles] = useState(getSelectedFiles());
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, FileMetadata>
  >({});
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const [autoFields, setAutoFields] = useState<AutoFields>({
    author: true,
    title: true,
    content: true,
    tags: true,
    sentiment: true,
    description: true,
    topics: true,
    style: true,
    color_palette: true,
    composition: true,
  });

  const { getModelsByGroup } = useConfigStore();
  const [llmConfig, setLlmConfig] = useState({
    model: "deepseek-r1:14b",
    temperature: 0.7,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const llmModelOptions = [
    ...getModelsByGroup("Text Generation Models"),
    ...getModelsByGroup("Vision Models"),
  ];

  const mergeField = (
    existing: string | undefined,
    newValue: string | undefined
  ): string => {
    if (existing && newValue) {
      return `${existing} ${newValue}`.trim();
    }
    return newValue || existing || "";
  };

  const mergeArrayField = (
    existing: string[] | undefined,
    newValue: string[] | undefined
  ): string[] => {
    const existingArr = existing || [];
    const newArr = newValue || [];
    return Array.from(new Set([...existingArr, ...newArr]));
  };

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
    setProcessedCount(0);

    if (files.length > 0) {
      setCurrentFileId(files[0].original_name);
    }
  }, [files]);

  const getCurrentFile = () => {
    return currentFileId
      ? files.find((f) => f.original_name === currentFileId)
      : null;
  };
  useEffect(() => {
    if (currentFileId !== null) {
      updateCurrentFileMetadata({
        file_type: getMainFileType(
          files.find((file) => file.original_name === currentFileId)
        ),
      });
    }
  }, [currentFileId]);
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
        return ["ocr", "image_description", "manual"];
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
    setFileMetadata((prev) => {
      const newMetadata = {
        ...prev,
        [currentFileId]: {
          ...prev[currentFileId],
          ...updates,
        },
      };

      // Si el método es manual y hay datos en el formulario, marcar como completado
      const currentMetadata = newMetadata[currentFileId];
      if (currentMetadata.processingMethod === "manual") {
        const hasData = Object.entries(currentMetadata).some(([key, value]) => {
          // Ignorar campos que no son relevantes para la validación
          if (
            key === "id" ||
            key === "processingStatus" ||
            key === "processingMethod" ||
            key === "tags"
          ) {
            return false;
          }
          // Verificar si hay datos en el campo
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== undefined && value !== "";
        });

        if (hasData) {
          currentMetadata.processingStatus = "completed";
        }
      }

      setTimeout(updateProcessedCount, 0);
      return newMetadata;
    });
  };
  const processWithLLMUnified = async (
    taskType: TaskType = "image_description",
    ocrMethod: OCRMethod = "tesseract"
  ) => {
    const currentFile = getCurrentFile();
    if (!currentFile) return;
    const existingMetadata = getCurrentFileMetadata();
    if (!existingMetadata) return;

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: taskType as ProcessingMethod,
      llmErrorResponse: "",
    });

    try {
      let result;
      if (taskType === "ocr") {
        result = await categorizerAPI.processLLM({
          task: "ocr",
          file_url: currentFile.file_url,
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          ocr_method: ocrMethod,
          prompt: "",
        });
      } else if (taskType === "image_description") {
        result = await categorizerAPI.processLLM({
          task: "image_description",
          file_url: currentFile.file_url,
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          prompt: "",
        });
      } else if (taskType === "text") {
        result = await categorizerAPI.processLLM({
          task: "text",
          input_text: "Default text prompt",
          model: llmConfig.model,
          temperature: llmConfig.temperature,
        });
      }

      if (result) {
        if (result.error) {
          updateCurrentFileMetadata({
            processingStatus: "failed",
            llmErrorResponse: result.raw || result.raw_analysis || "",
          });
          alert("Ocurrió un error al procesar el archivo con LLM.");
        } else {
          const llmData = result;
          if (taskType === "ocr") {
            updateCurrentFileMetadata({
              title: autoFields.title
                ? mergeField(existingMetadata.title, llmData.title)
                : existingMetadata.title,
              author: autoFields.author
                ? mergeField(existingMetadata.author, llmData.author)
                : existingMetadata.author,
              content: autoFields.content
                ? mergeField(existingMetadata.content, llmData.content)
                : existingMetadata.content,
              tags: autoFields.tags
                ? mergeArrayField(existingMetadata.tags, llmData.tags)
                : existingMetadata.tags,
              sentiment_word: autoFields.sentiment
                ? mergeField(
                    existingMetadata.sentiment_word,
                    llmData.sentiment_word
                  )
                : existingMetadata.sentiment_word,
              // Otros campos se actualizan directamente sin condicional
              work: llmData.work,
              languages: llmData.languages,
              sentiment_value: llmData.sentiment_value,
              analysis: llmData.analysis,
              categories: llmData.categories,
              keywords: llmData.keywords,
              content_type: llmData.content_type,
              multilingual: llmData.multilingual,
              processingStatus: "completed",
              llmErrorResponse: "",
            });
          } else if (taskType === "image_description") {
            updateCurrentFileMetadata({
              description: autoFields.description
                ? mergeField(existingMetadata.description, llmData.description)
                : existingMetadata.description,
              tags: autoFields.tags
                ? mergeArrayField(existingMetadata.tags, llmData.tags)
                : existingMetadata.tags,
              topics: autoFields.topics
                ? mergeArrayField(existingMetadata.topics, llmData.topics)
                : existingMetadata.topics,
              style: autoFields.style
                ? mergeField(existingMetadata.style, llmData.style)
                : existingMetadata.style,
              color_palette: autoFields.color_palette
                ? mergeArrayField(
                    existingMetadata.color_palette,
                    llmData.color_palette
                  )
                : existingMetadata.color_palette,
              composition: autoFields.composition
                ? mergeField(existingMetadata.composition, llmData.composition)
                : existingMetadata.composition,
              processingStatus: "completed",
              llmErrorResponse: "",
            });
          } else {
            // Para otros taskTypes, por ejemplo, "text":
            updateCurrentFileMetadata({
              content: autoFields.content
                ? mergeField(existingMetadata.content, llmData.content)
                : existingMetadata.content,
              processingStatus: "completed",
              llmErrorResponse: "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error en LLM Unified:", error);
      updateCurrentFileMetadata({
        processingStatus: "failed",
        llmErrorResponse: String(error),
      });
      alert("Ocurrió un error al procesar el archivo con LLM.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithLLM = async () => {
    processWithLLMUnified("image_description");
  };
  const processWithOCR = async () => {
    processWithLLMUnified("ocr", "tesseract");
  };

  const updateProcessedCount = () => {
    const completedCount = Object.values(fileMetadata).filter(
      (metadata) => metadata.processingStatus === "completed"
    ).length;
    setProcessedCount(completedCount);
  };

  const saveAllMetadata = async () => {
    if (processedCount < files.length) {
      alert(
        `No se pueden guardar los metadatos hasta que todos los archivos estén procesados. Faltan ${
          files.length - processedCount
        } archivos por procesar.`
      );
      return;
    }

    setIsProcessing(true);
    try {
      const allMetadata = Object.values(fileMetadata);
      await categorizerAPI.saveFilesMetadata(allMetadata);
      router.push("/pending");
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

  // Agregar función para manejar el cambio de método de procesamiento
  const handleProcessingMethodChange = (method: ProcessingMethod) => {
    if (!currentFileId) return;
    updateCurrentFileMetadata({
      processingMethod: method,
      processingStatus: method === "manual" ? "pending" : "processing",
    });
  };

  const handleDeleteFile = (id: string) => {
    setFileToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFile = () => {
    if (fileToDelete) {
      setFileMetadata((prev) => {
        const newMetadata = { ...prev };
        delete newMetadata[fileToDelete];
        setTimeout(updateProcessedCount, 0);
        return newMetadata;
      });
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
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
            <p className="mt-2 text-lg">
              Archivos procesados: {processedCount} de {files.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Nota: Para el método manual, debes agregar al menos un campo de
              metadatos para que se considere como procesado
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
                  updateMetadata={updateCurrentFileMetadata}
                  onProcessingMethodChange={handleProcessingMethodChange}
                />
              </div>
              <div>
                <MetadataForm
                  metadata={getCurrentFileMetadata()}
                  updateMetadata={updateCurrentFileMetadata}
                  addTag={addTag}
                  removeTag={removeTag}
                  onDeleteFile={() => handleDeleteFile(currentFileId)}
                />
                {currentFileId &&
                  fileMetadata[currentFileId]?.llmErrorResponse && (
                    <div className="mt-4 p-4 border-4 border-red-600 rounded-lg bg-red-100">
                      <h4 className="text-lg font-bold">
                        Respuesta incompleta del LLM
                      </h4>
                      <pre className="whitespace-pre-wrap text-sm">
                        {fileMetadata[currentFileId].llmErrorResponse}
                      </pre>
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <ButtonLink href="/pending" variant="outline" size="lg">
              <p className="text-xl">Volver</p>
            </ButtonLink>
            <BrutalButton
              onClick={saveAllMetadata}
              disabled={isProcessing || processedCount < files.length}
              variant="green"
            >
              {isProcessing
                ? "Guardando..."
                : processedCount < files.length
                ? `Faltan ${
                    files.length - processedCount
                  } archivos por procesar`
                : "Guardar metadatos"}
            </BrutalButton>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg border-4 border-red-500">
            <h3 className="text-xl font-bold mb-4">
              ¿Estás seguro de que deseas eliminar este archivo?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 border-4 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
