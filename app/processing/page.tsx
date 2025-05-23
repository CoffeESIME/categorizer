// app/processing/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useFileStore, FileItem as StoreFileItem } from "../store/filestore"; // Renamed to avoid conflict
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
import { useTranslation } from "react-i18next"; // For i18n

// Renamed to avoid conflict with FileItem from filestore
export type ProcessingFileMetadata = {
  embedding_type: string;
  //
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
  //
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
  const { t } = useTranslation(); // For i18n
  const {
    getSelectedFiles: getSelectedFilesFromStore,
    updateFile,
    removeFile: removeFileFromStore,
  } = useFileStore(); //

  // Local state for files being processed on this page
  const [filesToProcess, setFilesToProcess] = useState<StoreFileItem[]>([]);
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, ProcessingFileMetadata>
  >({});
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const [autoFields, setAutoFields] = useState<AutoFields>({
    //
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
  const [selectedMethodForUI, setSelectedMethodForUI] =
    useState<ProcessingMethod>("manual");

  const [llmConfig, setLlmConfig] = useState({
    model: "deepseek-r1:14b",
    temperature: 0.7,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const { getModelsByGroup, allModels } = useConfigStore();
  const llmModelOptions = React.useMemo(() => {
    // Flatten all models from all groups for the dropdown
    return allModels.flatMap((group) =>
      group.models.map((model) => ({ ...model, groupName: group.groupName }))
    );
  }, [allModels]);

  const mergeField = (
    //
    existing: string | undefined,
    newValue: string | undefined
  ): string => {
    if (existing && newValue) {
      return `${existing} ${newValue}`.trim();
    }
    return newValue || existing || "";
  };

  const mergeArrayField = (
    //
    existing: string[] | undefined,
    newValue: string[] | undefined
  ): string[] => {
    const existingArr = existing || [];
    const newArr = newValue || [];
    return Array.from(new Set([...existingArr, ...newArr]));
  };

  // Effect to initialize files and metadata on mount
  useEffect(() => {
    const selectedFiles = getSelectedFilesFromStore();
    setFilesToProcess(selectedFiles);

    const initialMetadata: Record<string, ProcessingFileMetadata> = {};
    selectedFiles.forEach((file) => {
      const mainType = getMainFileType(file);
      let defaultProcessingMethod: ProcessingMethod = "manual";
      if (mainType === "image") {
        defaultProcessingMethod = "image_description";
      } else if (
        mainType === "text" ||
        (mainType === "application" &&
          (file.file_type?.includes("json") ||
            file.file_type?.includes("pdf") ||
            file.file_type?.includes("text")))
      ) {
        defaultProcessingMethod = "llm";
      }

      // Determinar default embedding type
      let defaultEmbeddingType: string = "text";
      if (mainType === "image") {
        defaultEmbeddingType = "image_w_des";
      } else if (file.file_type === "application/pdf") {
        defaultEmbeddingType = "pdf";
      }

      initialMetadata[file.original_name] = {
        id: file.original_name, // Use original_name as key for metadata record
        file_type: file.file_type,
        tags: [],
        processingStatus: "pending",
        processingMethod: defaultProcessingMethod,
        embedding_type: defaultEmbeddingType,
      };
    });
    setFileMetadata(initialMetadata);
    setProcessedCount(0); // Reset count

    if (selectedFiles.length > 0) {
      const firstFileOriginalName = selectedFiles[0].original_name;
      setCurrentFileId(firstFileOriginalName);
      setSelectedMethodForUI(
        initialMetadata[firstFileOriginalName]?.processingMethod || "manual"
      );
    } else {
      setCurrentFileId(null);
      setSelectedMethodForUI("manual");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentFile = () => {
    //
    return currentFileId
      ? filesToProcess.find((f) => f.original_name === currentFileId)
      : null;
  };
  const getMainFileType = useCallback(
    (file: StoreFileItem | null | undefined): string => {
      return file?.file_type?.split("/")[0] || "unknown";
    },
    []
  );

  // Effect to update UI and metadata when currentFileId changes
  useEffect(() => {
    if (currentFileId) {
      const currentFile = filesToProcess.find(
        (f) => f.original_name === currentFileId
      );
      if (currentFile) {
        const mainType = getMainFileType(currentFile);
        let defaultProcessingMethod: ProcessingMethod = "manual";
        if (mainType === "image") {
          defaultProcessingMethod = "image_description";
        } else if (
          mainType === "text" ||
          (mainType === "application" &&
            (currentFile.file_type?.includes("json") ||
              currentFile.file_type?.includes("pdf") ||
              currentFile.file_type?.includes("text")))
        ) {
          defaultProcessingMethod = "llm";
        }

        // Determinar default embedding type
        let defaultEmbeddingType: string = "text";
        if (mainType === "image") {
          defaultEmbeddingType = "image_w_des";
        } else if (currentFile.file_type === "application/pdf") {
          defaultEmbeddingType = "pdf";
        }

        const existingMeta = fileMetadata[currentFileId];
        const processingMethodToSet =
          existingMeta?.processingMethod || defaultProcessingMethod;
        const embeddingTypeToSet =
          existingMeta?.embedding_type || defaultEmbeddingType;

        updateCurrentFileMetadata({
          file_type: mainType,
          processingMethod: processingMethodToSet,
          embedding_type: embeddingTypeToSet, // Establecer el tipo de embedding
          processingStatus:
            existingMeta?.processingStatus === "completed" &&
            processingMethodToSet === "manual"
              ? "completed"
              : existingMeta?.processingStatus === "failed"
              ? "pending" // If failed, reset to pending on file switch to allow retry
              : "pending", // Default to pending for new selections or method changes
        });
        setSelectedMethodForUI(processingMethodToSet);
      }
    } else {
      setSelectedMethodForUI("manual");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFileId, filesToProcess]); // Dependencies actualizadas

  const getCurrentFileMetadata = () => {
    //
    return currentFileId ? fileMetadata[currentFileId] : null;
  };

  const getProcessingOptions = (
    file: StoreFileItem | null
  ): ProcessingMethod[] => {
    //
    if (!file) return ["manual"];
    const mainType = getMainFileType(file);
    switch (mainType) {
      case "image":
        return ["ocr", "image_description", "manual"];
      case "video":
      case "audio":
        return ["llm", "manual"]; // Assuming general LLM for these types for now
      case "application":
        if (
          file.file_type?.includes("json") ||
          file.file_type?.includes("pdf") ||
          file.file_type?.includes("text")
        ) {
          return ["llm", "manual"];
        }
        return ["manual"];
      case "text": // Handle plain text files
        return ["llm", "manual"];
      default:
        return ["manual"];
    }
  };

  const updateProcessedCount = useCallback(
    (currentMetaState = fileMetadata) => {
      const completedCount = Object.values(currentMetaState).filter(
        (metadata) => metadata.processingStatus === "completed"
      ).length;
      setProcessedCount(completedCount);
    },
    [fileMetadata]
  );
  const updateCurrentFileMetadata = useCallback(
    (updates: Partial<ProcessingFileMetadata>) => {
      if (!currentFileId) return;
      setFileMetadata((prev) => {
        const currentMeta = prev[currentFileId] || {
          id: currentFileId,
          tags: [],
          processingStatus: "pending",
        };
        const newMetadataForFile = { ...currentMeta, ...updates };

        if (newMetadataForFile.processingMethod === "manual") {
          const hasData = Object.entries(newMetadataForFile).some(
            ([key, value]) => {
              if (
                [
                  "id",
                  "processingStatus",
                  "processingMethod",
                  "tags",
                  "file_type",
                  "llmErrorResponse",
                  "sourceType",
                  "extractedText",
                ].includes(key)
              ) {
                return false;
              }
              if (Array.isArray(value)) return value.length > 0;
              return value !== undefined && value !== "" && value !== null;
            }
          );

          if (hasData) {
            newMetadataForFile.processingStatus = "completed";
          }
        }

        const newState = {
          ...prev,
          [currentFileId]: newMetadataForFile,
        };

        // Use a functional update for setProcessedCount if it depends on the latest fileMetadata
        // Or call it after setFileMetadata has completed if possible (e.g. in a useEffect)
        // For now, deferring with setTimeout is a common workaround for batched updates.
        setTimeout(() => updateProcessedCount(newState), 0);
        return newState;
      });
    },
    [currentFileId, updateProcessedCount]
  ); // Added dependencies
  const processWithLLMUnified = async (
    taskType: TaskType = "image_description",
    ocrMethod: OCRMethod = "tesseract"
  ) => {
    const currentFile = getCurrentFile();
    if (!currentFile || !currentFile.file_url) {
      alert("Archivo no encontrado o URL de archivo no disponible.");
      return;
    }
    const existingMetadata = fileMetadata[currentFile.original_name]; // Use original_name as key
    if (!existingMetadata) {
      alert("Metadatos del archivo no encontrados.");
      return;
    }

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: taskType as ProcessingMethod, // Ensure taskType is a valid ProcessingMethod
      llmErrorResponse: "",
    });

    try {
      let result;
      const commonLLMOptions = {
        model: llmConfig.model,
        temperature: llmConfig.temperature,
      };

      if (taskType === "ocr") {
        result = await categorizerAPI.processLLM({
          task: "ocr",
          file_url: currentFile.file_url,
          ...commonLLMOptions,
          ocr_method: ocrMethod,
        });
      } else if (taskType === "image_description") {
        result = await categorizerAPI.processLLM({
          task: "image_description",
          file_url: currentFile.file_url,
          ...commonLLMOptions,
        });
      } else if (taskType === "text") {
        result = await categorizerAPI.processTextLLM({
          file_url: currentFile.file_url,
          ...commonLLMOptions,
        });
      }

      if (result) {
        if (result.error) {
          updateCurrentFileMetadata({
            processingStatus: "failed",
            llmErrorResponse:
              result.raw || result.raw_analysis || JSON.stringify(result.error),
          });
          alert(t("processing.uploadError"));
        } else {
          const llmData = result;
          const updates: Partial<ProcessingFileMetadata> = {
            processingStatus: "completed",
            llmErrorResponse: "",
          };

          if (taskType === "ocr" || taskType === "text") {
            if (autoFields.title)
              updates.title = mergeField(existingMetadata.title, llmData.title);
            if (autoFields.author)
              updates.author = mergeField(
                existingMetadata.author,
                llmData.author
              );
            if (autoFields.content)
              updates.content = mergeField(
                existingMetadata.content,
                llmData.content || llmData.text || llmData.ocr_text
              );
            if (autoFields.tags)
              updates.tags = mergeArrayField(
                existingMetadata.tags,
                llmData.tags
              );
            if (autoFields.sentiment) {
              updates.sentiment_word = mergeField(
                existingMetadata.sentiment_word,
                llmData.sentiment_word
              );
              updates.sentiment_value =
                llmData.sentiment_value !== undefined
                  ? llmData.sentiment_value
                  : existingMetadata.sentiment_value;
            }
            updates.work = llmData.work || existingMetadata.work;
            updates.languages = llmData.languages || existingMetadata.languages;
            updates.analysis = llmData.analysis || existingMetadata.analysis;
            updates.categories =
              llmData.categories || existingMetadata.categories;
            updates.keywords = llmData.keywords || existingMetadata.keywords;
            updates.content_type =
              llmData.content_type || existingMetadata.content_type;
            updates.multilingual =
              llmData.multilingual !== undefined
                ? llmData.multilingual
                : existingMetadata.multilingual;
            if (taskType === "ocr")
              updates.extractedText = llmData.text || llmData.ocr_text;
          } else if (taskType === "image_description") {
            if (autoFields.description)
              updates.description = mergeField(
                existingMetadata.description,
                llmData.description
              );
            if (autoFields.tags)
              updates.tags = mergeArrayField(
                existingMetadata.tags,
                llmData.tags
              );
            if (autoFields.topics)
              updates.topics = mergeArrayField(
                existingMetadata.topics,
                llmData.topics
              );
            if (autoFields.style)
              updates.style = mergeField(existingMetadata.style, llmData.style);
            if (autoFields.color_palette)
              updates.color_palette = mergeArrayField(
                existingMetadata.color_palette,
                llmData.color_palette
              );
            if (autoFields.composition)
              updates.composition = mergeField(
                existingMetadata.composition,
                llmData.composition
              );
          }
          updateCurrentFileMetadata(updates);
        }
      }
    } catch (error) {
      console.error(`Error en LLM unificado (${taskType}):`, error);
      updateCurrentFileMetadata({
        processingStatus: "failed",
        llmErrorResponse: String(error),
      });
      alert(t("processing.uploadError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithLLM = async () => {
    //
    const currentFile = getCurrentFile();
    if (!currentFile) return;
    const mainType = getMainFileType(currentFile); //
    if (mainType === "image") {
      processWithLLMUnified("image_description"); //
    } else {
      processWithLLMUnified("text"); //
    }
  };
  const processWithOCR = async () => {
    //
    processWithLLMUnified("ocr", "tesseract"); //
  };

  const saveAllMetadata = async () => {
    if (processedCount < filesToProcess.length) {
      alert(
        t("processing.savingNotAllowed", {
          count: filesToProcess.length - processedCount,
        })
      );
      return;
    }

    setIsProcessing(true);
    try {
      const allMetadataToSave = filesToProcess.map((file) => {
        const metadata = fileMetadata[file.original_name]; // Use original_name as key
        return {
          ...metadata,
          id: file.id, // Crucially, use the original file.id from the store for saving
          original_name: file.original_name,
          file_url: file.file_url,
          file_type: file.file_type,
          status: "categorized" as const, // Ensure status type matches FileStatus
        };
      });
      await categorizerAPI.saveFilesMetadata(allMetadataToSave);

      allMetadataToSave.forEach((meta) => {
        updateFile(meta.id, { status: "categorized" });
      });

      alert(t("processing.saveComplete"));
      router.push("/pending");
    } catch (error) {
      console.error("Error al guardar metadatos:", error);
      alert(t("general.error") + ": " + t("processing.uploadError"));
    } finally {
      setIsProcessing(false);
    }
  };
  const toggleAutoField = (field: string) => {
    //
    setAutoFields((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const addTag = (tag: string) => {
    //
    if (!currentFileId || !tag.trim()) return;
    setFileMetadata((prev) => {
      const currentTags = prev[currentFileId]?.tags || [];
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
    //
    if (!currentFileId) return;
    setFileMetadata((prev) => {
      const currentTags = prev[currentFileId]?.tags || [];
      return {
        ...prev,
        [currentFileId]: {
          ...prev[currentFileId],
          tags: currentTags.filter((t) => t !== tag),
        },
      };
    });
  };

  const handleProcessingMethodChange = (method: ProcessingMethod) => {
    if (!currentFileId) return;
    setSelectedMethodForUI(method);

    const currentMeta = fileMetadata[currentFileId];
    let newStatus = currentMeta?.processingStatus || "pending";

    if (method === "manual") {
      // If switching to manual, and it was processing, keep it pending unless already completed by manual.
      // If it was completed by an auto method, and we switch to manual, it should remain completed or allow re-evaluation.
      // For simplicity now, if completed, it stays completed. If processing, becomes pending.
      if (newStatus === "processing") newStatus = "pending";
    } else {
      // If switching to an automated method
      if (newStatus === "completed")
        newStatus = "pending"; // Mark for reprocessing
      else if (newStatus === "failed") newStatus = "pending"; // Allow retry
      else newStatus = "processing"; // Default to processing for auto methods
    }

    updateCurrentFileMetadata({
      processingMethod: method,
      processingStatus: newStatus,
      ...(method !== "manual" && { llmErrorResponse: "" }),
    });
  };

  const handleDeleteFile = (fileName: string) => {
    //
    setFileToDelete(fileName);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFile = () => {
    if (fileToDelete) {
      const originalFileIdToDelete = filesToProcess.find(
        (f) => f.original_name === fileToDelete
      )?.id;

      setFilesToProcess((prevFiles) =>
        prevFiles.filter((f) => f.original_name !== fileToDelete)
      );
      setFileMetadata((prevMeta) => {
        const newMeta = { ...prevMeta };
        delete newMeta[fileToDelete];
        setTimeout(() => updateProcessedCount(newMeta), 0);
        return newMeta;
      });

      if (currentFileId === fileToDelete) {
        const remainingFiles = filesToProcess.filter(
          (f) => f.original_name !== fileToDelete
        );
        const nextFileId =
          remainingFiles.length > 0 ? remainingFiles[0].original_name : null;
        setCurrentFileId(nextFileId);
        setSelectedMethodForUI(
          nextFileId
            ? fileMetadata[nextFileId]?.processingMethod || "manual"
            : "manual"
        );
      }

      if (originalFileIdToDelete) {
        removeFileFromStore(originalFileIdToDelete);
      }

      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const handleDiscardFile = (fileName: string) => {
    const fileToDiscard = filesToProcess.find(
      (f) => f.original_name === fileName
    );
    if (!fileToDiscard) return;

    setFilesToProcess((prevFiles) =>
      prevFiles.filter((f) => f.original_name !== fileName)
    );
    setFileMetadata((prevMeta) => {
      const newMeta = { ...prevMeta };
      delete newMeta[fileName];
      setTimeout(() => updateProcessedCount(newMeta), 0);
      return newMeta;
    });

    if (currentFileId === fileName) {
      const remainingFiles = filesToProcess.filter(
        (f) => f.original_name !== fileName
      );
      const nextFileOriginalName =
        remainingFiles.length > 0 ? remainingFiles[0].original_name : null;
      setCurrentFileId(nextFileOriginalName);
      setSelectedMethodForUI(
        nextFileOriginalName
          ? fileMetadata[nextFileOriginalName]?.processingMethod || "manual"
          : "manual"
      );
    }

    updateFile(fileToDiscard.id, { selected: false });
  };
  const handleEmbeddingTypeChange = (newEmbeddingType: string) => {
    if (currentFileId) {
      updateCurrentFileMetadata({ embedding_type: newEmbeddingType });
    }
  };
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col bg-yellow-100">
      <TitleComponent title={t("processing.title")} variant="neobrutalism" />

      <div className="max-w-6xl mx-auto w-full">
        <div className="p-4 border-4 border-black bg-white rounded-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              {t("processing.title")} ({filesToProcess.length})
            </h2>
            <p>{t("processing.subtitle")}</p>
            <p className="mt-2 text-lg">
              {t("processing.filesProcessed", {
                count: processedCount,
                total: filesToProcess.length,
              })}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{t("fileList.title")}:</h3>
            <FileList
              files={filesToProcess}
              fileMetadata={fileMetadata}
              currentFileId={currentFileId}
              setCurrentFileId={(id) => {
                setCurrentFileId(id);
                //setSelectedMethodForUI(fileMetadata[id]?.processingMethod || 'manual'); // Ensure UI method updates
              }}
              getMainFileType={getMainFileType}
              onDiscardFile={handleDiscardFile}
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
                  activeProcessingMethod={selectedMethodForUI} // Pass the UI driving state
                  onProcessingMethodChange={handleProcessingMethodChange}
                />
              </div>
              <div>
                <MetadataForm
                  metadata={getCurrentFileMetadata()}
                  updateMetadata={updateCurrentFileMetadata}
                  addTag={addTag}
                  removeTag={removeTag}
                  onDeleteFile={
                    currentFileId
                      ? () => handleDeleteFile(currentFileId)
                      : undefined
                  }
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
              <p className="text-xl">{t("general.back")}</p>
            </ButtonLink>
            <BrutalButton
              onClick={saveAllMetadata}
              disabled={isProcessing || processedCount < filesToProcess.length}
              variant="green"
            >
              {isProcessing
                ? t("general.loading")
                : processedCount < filesToProcess.length
                ? t("processing.savingNotAllowed", {
                    count: filesToProcess.length - processedCount,
                  })
                : t("processing.saveMetadata")}
            </BrutalButton>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg border-4 border-red-500">
            <h3 className="text-xl font-bold mb-4">
              {t("processing.deleteConfirm")}
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 border-4 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {t("general.cancel")}
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {t("general.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
