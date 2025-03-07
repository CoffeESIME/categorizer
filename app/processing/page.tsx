"use client";

import { useState, useEffect } from "react";
import { useFileStore } from "../store/filestore";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import categorizerAPI from "../utils/categorizerAPI";

// Tipo para los metadatos
type FileMetadata = {
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
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar metadatos
  useEffect(() => {
    const initialMetadata: Record<string, FileMetadata> = {};
    files.forEach((file) => {
      initialMetadata[file.id] = {
        id: file.id,
        tags: [],
        processingStatus: "pending",
      };
    });
    setFileMetadata(initialMetadata);

    // Seleccionar el primer archivo automáticamente
    if (files.length > 0 && !currentFileId) {
      setCurrentFileId(files[0].id);
    }
  }, [files, currentFileId]);

  // Obtener el archivo actual
  const getCurrentFile = () => {
    return currentFileId ? files.find((f) => f.id === currentFileId) : null;
  };

  const getCurrentFileMetadata = () => {
    return currentFileId ? fileMetadata[currentFileId] : null;
  };

  // Determinar el tipo principal del archivo
  const getMainFileType = (file: any) => {
    return file?.type?.split("/")[0] || "unknown";
  };

  // Obtener opciones de procesamiento según el tipo de archivo
  const getProcessingOptions = (file: any) => {
    const mainType = getMainFileType(file);

    switch (mainType) {
      case "image":
        return ["ocr", "llm", "manual"];
      case "video":
        return ["llm", "manual"];
      case "audio":
        return ["llm", "manual"];
      case "application":
        if (file.type.includes("json") || file.type.includes("pdf")) {
          return ["llm", "manual"];
        }
        return ["manual"];
      default:
        return ["manual"];
    }
  };

  // Actualizar metadata del archivo actual
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

  // Procesar archivo con LLM
  const processWithLLM = async () => {
    const currentFile = getCurrentFile();
    if (!currentFile || !currentFile.filePath) return;

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: "llm",
    });

    try {
      // Llamar al API para procesar con LLM
      const result = await categorizerAPI.processFileWithLLM(
        currentFile.filePath,
        {
          extractAuthor: autoFields.author,
          extractTitle: autoFields.title,
          extractDescription: autoFields.description,
          extractTags: autoFields.tags,
        }
      );

      // Actualizar metadata con resultado
      updateCurrentFileMetadata({
        author: result.author,
        title: result.title,
        description: result.description,
        tags: result.tags || [],
        extractedText: result.extractedText,
        processingStatus: "completed",
      });
    } catch (error) {
      console.error("Error al procesar con LLM:", error);
      updateCurrentFileMetadata({ processingStatus: "failed" });
      alert(
        "Error al procesar archivo con LLM. Por favor, intenta nuevamente."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar imagen con OCR
  const processWithOCR = async () => {
    const currentFile = getCurrentFile();
    if (!currentFile || !currentFile.filePath) return;

    setIsProcessing(true);
    updateCurrentFileMetadata({
      processingStatus: "processing",
      processingMethod: "ocr",
    });

    try {
      // Llamar al API para OCR
      const result = await categorizerAPI.processImageWithOCR(
        currentFile.filePath
      );

      // Actualizar metadata con resultado
      updateCurrentFileMetadata({
        extractedText: result.text,
        processingStatus: "completed",
      });
    } catch (error) {
      console.error("Error al procesar con OCR:", error);
      updateCurrentFileMetadata({ processingStatus: "failed" });
      alert("Error al procesar imagen con OCR. Por favor, intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Guardar metadatos finales
  const saveAllMetadata = async () => {
    setIsProcessing(true);
    try {
      const allMetadata = Object.values(fileMetadata);
      await categorizerAPI.saveFilesMetadata(allMetadata);
      alert("Metadatos guardados correctamente!");
    } catch (error) {
      console.error("Error al guardar metadatos:", error);
      alert("Error al guardar metadatos. Por favor, intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Renderizar preview del archivo
  const renderFilePreview = () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return null;

    const mainType = getMainFileType(currentFile);
    const fileURL = currentFile.filePath
      ? `${process.env.NEXT_PUBLIC_API_URL}/files/${currentFile.filePath}`
      : URL.createObjectURL(currentFile.file);

    switch (mainType) {
      case "image":
        return (
          <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
            <img
              src={fileURL}
              alt={currentFile.file.name}
              className="max-h-64 max-w-full mx-auto object-contain"
            />
          </div>
        );
      case "video":
        return (
          <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
            <video controls className="max-h-64 max-w-full mx-auto">
              <source src={fileURL} type={currentFile.type} />
              Tu navegador no soporta este video.
            </video>
          </div>
        );
      case "audio":
        return (
          <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
            <audio controls className="w-full">
              <source src={fileURL} type={currentFile.type} />
              Tu navegador no soporta este audio.
            </audio>
          </div>
        );
      case "application":
        if (currentFile.type.includes("json")) {
          return (
            <div className="border-4 border-black rounded-lg p-2 bg-gray-100 overflow-auto max-h-64">
              <pre className="text-xs">
                {JSON.stringify(
                  JSON.parse(URL.createObjectURL(currentFile.file)),
                  null,
                  2
                )}
              </pre>
            </div>
          );
        }
        return (
          <div className="border-4 border-black rounded-lg p-2 bg-gray-100 flex items-center justify-center">
            <p className="text-center">
              <span className="text-3xl">📄</span>
              <br />
              {currentFile.file.name}
            </p>
          </div>
        );
      default:
        return (
          <div className="border-4 border-black rounded-lg p-2 bg-gray-100 flex items-center justify-center">
            <p className="text-center">
              <span className="text-3xl">🗃️</span>
              <br />
              {currentFile.file.name}
            </p>
          </div>
        );
    }
  };

  // Agregar un tag
  const addTag = (tag: string) => {
    if (!currentFileId || !tag.trim()) return;

    setFileMetadata((prev) => {
      const currentTags = prev[currentFileId].tags || [];
      if (!currentTags.includes(tag)) {
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

  // Eliminar un tag
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

  // Renderizar sección de metadatos
  const renderMetadataForm = () => {
    const currentMetadata = getCurrentFileMetadata();
    if (!currentMetadata) return null;

    return (
      <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
        <h3 className="text-xl font-bold">Metadatos del Archivo</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="font-bold">Autor</label>
              <CustomCheckbox
                checked={autoFields.author}
                onChange={() =>
                  setAutoFields((prev) => ({ ...prev, author: !prev.author }))
                }
                label="Auto"
              />
            </div>
            <input
              type="text"
              value={currentMetadata.author || ""}
              onChange={(e) =>
                updateCurrentFileMetadata({ author: e.target.value })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
              placeholder="Autor del contenido"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="font-bold">Título</label>
              <CustomCheckbox
                checked={autoFields.title}
                onChange={() =>
                  setAutoFields((prev) => ({ ...prev, title: !prev.title }))
                }
                label="Auto"
              />
            </div>
            <input
              type="text"
              value={currentMetadata.title || ""}
              onChange={(e) =>
                updateCurrentFileMetadata({ title: e.target.value })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
              placeholder="Título del contenido"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="font-bold">Descripción</label>
              <CustomCheckbox
                checked={autoFields.description}
                onChange={() =>
                  setAutoFields((prev) => ({
                    ...prev,
                    description: !prev.description,
                  }))
                }
                label="Auto"
              />
            </div>
            <textarea
              value={currentMetadata.description || ""}
              onChange={(e) =>
                updateCurrentFileMetadata({ description: e.target.value })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
              rows={3}
              placeholder="Descripción del contenido"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="font-bold">Tags</label>
              <CustomCheckbox
                checked={autoFields.tags}
                onChange={() =>
                  setAutoFields((prev) => ({ ...prev, tags: !prev.tags }))
                }
                label="Auto"
              />
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                id="tagInput"
                className="flex-1 p-2 border-4 border-black rounded-lg"
                placeholder="Agregar tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <BrutalButton
                onClick={() => {
                  const input = document.getElementById(
                    "tagInput"
                  ) as HTMLInputElement;
                  addTag(input.value);
                  input.value = "";
                }}
                variant="teal"
              >
                +
              </BrutalButton>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentMetadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-200 border-2 border-black px-2 py-1 rounded-lg flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {currentMetadata.extractedText && (
            <div>
              <label className="font-bold">Texto Extraído</label>
              <div className="mt-1 p-2 border-4 border-black rounded-lg bg-gray-100 max-h-40 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm">
                  {currentMetadata.extractedText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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

          {/* Selector de archivos */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">
              Selecciona un archivo para procesar:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border-2 border-black rounded-lg">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setCurrentFileId(file.id)}
                  className={`p-2 border-2 rounded-lg cursor-pointer text-sm truncate ${
                    currentFileId === file.id
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 hover:bg-gray-100"
                  } ${
                    fileMetadata[file.id]?.processingStatus === "completed"
                      ? "bg-green-100"
                      : fileMetadata[file.id]?.processingStatus === "processing"
                      ? "bg-yellow-100"
                      : fileMetadata[file.id]?.processingStatus === "failed"
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span>
                      {getMainFileType(file) === "image" && "🖼️"}
                      {getMainFileType(file) === "video" && "🎬"}
                      {getMainFileType(file) === "audio" && "🎵"}
                      {getMainFileType(file) === "application" && "📄"}
                      {getMainFileType(file) === "unknown" && "📁"}
                    </span>
                    <span className="ml-1 truncate">{file.file.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentFileId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna izquierda: Preview y opciones de procesamiento */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Vista previa</h3>
                {renderFilePreview()}

                <div className="border-4 border-black rounded-lg p-4 bg-white">
                  <h3 className="text-xl font-bold mb-2">
                    Opciones de procesamiento
                  </h3>

                  {/* Mostrar opciones según el tipo de archivo */}
                  <div className="space-y-3">
                    {getProcessingOptions(getCurrentFile()).includes("ocr") && (
                      <BrutalButton
                        onClick={processWithOCR}
                        disabled={isProcessing}
                        variant="blue"
                        className="w-full"
                      >
                        {isProcessing
                          ? "Procesando..."
                          : "Extraer texto con OCR (Tesseract)"}
                      </BrutalButton>
                    )}

                    {getProcessingOptions(getCurrentFile()).includes("llm") && (
                      <BrutalButton
                        onClick={processWithLLM}
                        disabled={isProcessing}
                        variant="purple"
                        className="w-full"
                      >
                        {isProcessing ? "Procesando..." : "Analizar con LLM"}
                      </BrutalButton>
                    )}

                    <div className="mt-4 p-3 border-2 border-black rounded-lg bg-yellow-100">
                      <h4 className="font-bold">
                        Campos a extraer automáticamente:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <CustomCheckbox
                          checked={autoFields.author}
                          onChange={() =>
                            setAutoFields((prev) => ({
                              ...prev,
                              author: !prev.author,
                            }))
                          }
                          label="Autor"
                        />
                        <CustomCheckbox
                          checked={autoFields.title}
                          onChange={() =>
                            setAutoFields((prev) => ({
                              ...prev,
                              title: !prev.title,
                            }))
                          }
                          label="Título"
                        />
                        <CustomCheckbox
                          checked={autoFields.description}
                          onChange={() =>
                            setAutoFields((prev) => ({
                              ...prev,
                              description: !prev.description,
                            }))
                          }
                          label="Descripción"
                        />
                        <CustomCheckbox
                          checked={autoFields.tags}
                          onChange={() =>
                            setAutoFields((prev) => ({
                              ...prev,
                              tags: !prev.tags,
                            }))
                          }
                          label="Tags"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Formulario de metadatos */}
              <div>{renderMetadataForm()}</div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-6 flex justify-between">
            <ButtonLink href="/upload" variant="outline" size="lg">
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
