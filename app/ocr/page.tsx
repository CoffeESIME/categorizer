"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import categorizerAPI from "../utils/categorizerAPI";

/** Representa la información local de un archivo en el front */
interface LocalFile {
  file: File; // Objeto File nativo
  id: string; // ID único local
  filePath?: string; // Ruta devuelta por el backend (cuando se sube)
  selected: boolean; // Para marcarlo en la UI
  type: string; // E.g. "image/png"
  processed?: boolean; // Flag para saber si ya se procesó
}

/** Representa metadatos de un archivo (podrías ampliarlo) */
interface FileMetadata {
  id: string;
  author?: string;
  title?: string;
  description?: string;
  tags: string[];
  extractedText?: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  processingMethod?: "manual" | "llm" | "ocr";
}

export default function CategorizerAllInOnePage() {
  /************************************************************************
   * 1) STATE: CONTROL DE PASOS, ARCHIVOS, Y METADATOS
   ************************************************************************/
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Lista local de archivos agregados por el usuario (en dropzone)
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Almacenamos metadatos de cada archivo que vaya a procesar:
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, FileMetadata>
  >({});

  // ID del archivo que se esté "editando" o procesando en la UI
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  // Flags para extracción automática:
  const [autoFields, setAutoFields] = useState({
    author: false,
    title: false,
    description: false,
    tags: false,
  });

  // Para mostrar u ocultar estado de "pendiente"
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Para habilitar o deshabilitar botones durante procesamiento
  const [isProcessing, setIsProcessing] = useState(false);

  /************************************************************************
   * 2) DROPZONE: AÑADIR ARCHIVOS
   ************************************************************************/
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      selected: false,
      type: file.type,
      processed: false,
    }));
    setLocalFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  /************************************************************************
   * 3) SUBIR AL BACKEND
   ************************************************************************/
  const handleUpload = async () => {
    if (localFiles.length === 0) return;
    setUploading(true);
    try {
      // Filtrar archivos que no tengan filePath (o sea, no subidos aún)
      const filesToUpload = localFiles.filter((f) => !f.filePath);

      if (filesToUpload.length === 0) {
        alert("Todos los archivos ya están subidos");
        setStep(2);
        return;
      }

      // Subirlos a través de categorizerAPI
      const uploaded = await categorizerAPI.uploadFiles(
        filesToUpload.map((f) => f.file)
      );

      // Tomamos la ruta devuelta y actualizamos en localFiles
      const updatedLocalFiles = localFiles.map((lf) => {
        const found = uploaded.find((u) => u.fileName === lf.file.name);
        if (found) {
          // Retornamos el mismo localFile con la filePath
          return { ...lf, filePath: found.filePath };
        }
        return lf;
      });

      setLocalFiles(updatedLocalFiles);

      // Iniciar su fileMetadata local con "pending"
      const newMetadata: Record<string, FileMetadata> = {};
      updatedLocalFiles.forEach((lf) => {
        if (!fileMetadata[lf.id]) {
          newMetadata[lf.id] = {
            id: lf.id,
            tags: [],
            processingStatus: "pending",
          };
        }
      });
      setFileMetadata((prev) => ({ ...prev, ...newMetadata }));

      setStep(2);
    } catch (error) {
      console.error("Error al subir archivos:", error);
      alert("Error al subir archivos. Revisa la consola.");
    } finally {
      setUploading(false);
    }
  };

  /************************************************************************
   * 4) PENDIENTES: LÓGICA Y FILTRO
   ************************************************************************/
  // “Pendiente” = fileMetadata[lf.id]?.processingStatus === "pending"
  const getPendingFiles = () => {
    return localFiles.filter((lf) => {
      const meta = fileMetadata[lf.id];
      return meta?.processingStatus === "pending";
    });
  };

  /************************************************************************
   * 5) SELECCIÓN Y PROCESAMIENTO
   ************************************************************************/
  const toggleSelection = (id: string) => {
    setLocalFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  // Procesar con LLM
  const processWithLLM = async (fileId: string) => {
    const lf = localFiles.find((x) => x.id === fileId);
    if (!lf || !lf.filePath) return;

    setIsProcessing(true);
    updateFileMetadata(fileId, {
      processingStatus: "processing",
      processingMethod: "llm",
    });

    try {
      const result = await categorizerAPI.processFileWithLLM(lf.filePath, {
        extractAuthor: autoFields.author,
        extractTitle: autoFields.title,
        extractDescription: autoFields.description,
        extractTags: autoFields.tags,
      });
      updateFileMetadata(fileId, {
        author: result.author,
        title: result.title,
        description: result.description,
        tags: result.tags || [],
        extractedText: result.extractedText,
        processingStatus: "completed",
      });
    } catch (err) {
      console.error("Error LLM:", err);
      updateFileMetadata(fileId, { processingStatus: "failed" });
      alert("Error al procesar con LLM");
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar con OCR (para imágenes, por ejemplo)
  const processWithOCR = async (fileId: string) => {
    const lf = localFiles.find((x) => x.id === fileId);
    if (!lf || !lf.filePath) return;

    setIsProcessing(true);
    updateFileMetadata(fileId, {
      processingStatus: "processing",
      processingMethod: "ocr",
    });

    try {
      const result = await categorizerAPI.processImageWithOCR(lf.filePath);
      updateFileMetadata(fileId, {
        extractedText: result.text,
        processingStatus: "completed",
      });
    } catch (err) {
      console.error("Error OCR:", err);
      updateFileMetadata(fileId, { processingStatus: "failed" });
      alert("Error al procesar con OCR");
    } finally {
      setIsProcessing(false);
    }
  };

  // Guardar todo
  const handleSaveAllMetadata = async () => {
    setIsProcessing(true);
    try {
      const all = Object.values(fileMetadata);
      await categorizerAPI.saveFilesMetadata(all);
      alert("Metadatos guardados con éxito");
    } catch (error) {
      console.error("Error guardando metadatos:", error);
      alert("Error guardando metadatos");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para actualizar metadatos en el state local
  const updateFileMetadata = (
    fileId: string,
    updates: Partial<FileMetadata>
  ) => {
    setFileMetadata((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        ...updates,
      },
    }));
  };

  // Retorna la info de metadatos en el "currentFileId"
  const getCurrentFileMetadata = () => {
    if (!currentFileId) return null;
    return fileMetadata[currentFileId] || null;
  };

  /************************************************************************
   * 6) DETECTAR EL TIPO PRINCIPAL DE UN ARCHIVO
   ************************************************************************/
  const getMainFileType = (f: LocalFile) => {
    if (!f.type) return "unknown";
    return f.type.split("/")[0]; // image, video, audio, application...
  };

  /************************************************************************
   * 7) RENDER UI
   ************************************************************************/
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Categorizador Unificado" variant="neobrutalism" />

      <div className="max-w-5xl w-full p-4 border-4 border-black bg-white rounded-lg space-y-8">
        {/* STEP 1: Subir archivos */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Paso 1: Añadir y Subir Archivos
            </h2>

            <div
              {...getRootProps()}
              className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-xl ${
                isDragActive ? "bg-green-300" : "bg-blue-300"
              }`}
            >
              <input {...getInputProps()} />
              {localFiles.length > 0 ? (
                <p>{localFiles.length} archivos preparados</p>
              ) : (
                <p className="font-bold">
                  Arrastra y suelta archivos, o haz click aquí
                </p>
              )}
            </div>

            {localFiles.length > 0 && (
              <div className="mt-4 border-2 border-black p-3 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="text-lg font-bold mb-2">Archivos locales:</h3>
                <ul className="space-y-2">
                  {localFiles.map((lf) => (
                    <li
                      key={lf.id}
                      className="flex items-center justify-between border-b border-gray-300 py-2"
                    >
                      <span className="truncate max-w-md">
                        {lf.file.name} ({(lf.file.size / 1024).toFixed(2)} KB)
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {lf.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between">
              <BrutalButton
                onClick={() => setLocalFiles([])}
                variant="red"
                disabled={localFiles.length === 0}
              >
                Limpiar
              </BrutalButton>
              <BrutalButton
                variant="blue"
                onClick={handleUpload}
                disabled={localFiles.length === 0 || uploading}
              >
                {uploading ? "Subiendo..." : "Subir al servidor"}
              </BrutalButton>
            </div>
          </>
        )}

        {/* STEP 2: Ver Pendientes & Seleccionar para Procesar */}
        {step === 2 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <BrutalButton
                variant="gray"
                onClick={() => setStep(1)}
                className="text-black"
              >
                Volver
              </BrutalButton>
              <h2 className="text-2xl font-bold">Paso 2: Pendientes</h2>
            </div>

            <div className="flex items-center mb-4 space-x-4">
              <label className="font-medium">Mostrar sólo pendientes:</label>
              <CustomCheckbox
                label="Pendientes"
                checked={showPendingOnly}
                onChange={() => setShowPendingOnly(!showPendingOnly)}
              />
            </div>

            <div className="border-2 border-black p-3 rounded-lg max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {localFiles
                  .filter((f) => {
                    if (!showPendingOnly) return true;
                    return fileMetadata[f.id]?.processingStatus === "pending";
                  })
                  .map((lf) => {
                    const meta = fileMetadata[lf.id];
                    return (
                      <li
                        key={lf.id}
                        className={`flex items-center justify-between p-2 border-b border-gray-300 rounded ${
                          lf.selected ? "bg-green-100" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CustomCheckbox
                            checked={lf.selected}
                            onChange={() => toggleSelection(lf.id)}
                            label={lf.file.name}
                          />
                          {meta?.processingStatus === "completed" && (
                            <span className="text-xs bg-green-300 px-1 rounded">
                              ✓
                            </span>
                          )}
                          {meta?.processingStatus === "failed" && (
                            <span className="text-xs bg-red-300 px-1 rounded">
                              Err
                            </span>
                          )}
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {lf.type}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div className="flex justify-end mt-4">
              <BrutalButton
                variant="green"
                onClick={() => setStep(3)}
                disabled={localFiles.filter((f) => f.selected).length === 0}
              >
                Procesar Seleccionados
              </BrutalButton>
            </div>
          </>
        )}

        {/* STEP 3: Procesar los archivos seleccionados */}
        {step === 3 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <BrutalButton variant="gray" onClick={() => setStep(2)}>
                Volver
              </BrutalButton>
              <h2 className="text-2xl font-bold">Paso 3: Procesar</h2>
            </div>

            {/* Selector rápido del archivo a procesar */}
            <div className="border-2 border-black p-3 rounded-lg max-h-32 overflow-y-auto mb-4">
              <h3 className="font-bold mb-2">Archivos Seleccionados:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {localFiles
                  .filter((f) => f.selected)
                  .map((lf) => {
                    const meta = fileMetadata[lf.id];
                    return (
                      <div
                        key={lf.id}
                        onClick={() => setCurrentFileId(lf.id)}
                        className={`p-2 border-2 rounded-lg cursor-pointer text-sm ${
                          currentFileId === lf.id
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300 hover:bg-gray-100"
                        } ${
                          meta?.processingStatus === "completed"
                            ? "bg-green-100"
                            : meta?.processingStatus === "processing"
                            ? "bg-yellow-100"
                            : meta?.processingStatus === "failed"
                            ? "bg-red-100"
                            : ""
                        }`}
                      >
                        <p className="truncate">{lf.file.name}</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {currentFileId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vista previa */}
                <div>
                  <h4 className="font-bold mb-2">Vista Previa</h4>
                  <PreviewBlock
                    file={localFiles.find((f) => f.id === currentFileId)!}
                  />
                  <div className="mt-4 p-4 border-2 border-black rounded-lg">
                    <h4 className="font-bold mb-2">
                      Herramientas de Procesado
                    </h4>
                    {/* Se decide qué opciones hay según el tipo */}
                    {getMainFileType(
                      localFiles.find((f) => f.id === currentFileId)!
                    ) === "image" && (
                      <BrutalButton
                        variant="blue"
                        onClick={() => processWithOCR(currentFileId)}
                        disabled={isProcessing}
                        className="w-full mb-2"
                      >
                        {isProcessing ? "Procesando..." : "OCR"}
                      </BrutalButton>
                    )}
                    <BrutalButton
                      variant="purple"
                      onClick={() => processWithLLM(currentFileId)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? "Procesando..." : "Analizar con LLM"}
                    </BrutalButton>

                    <div className="mt-4 p-2 border border-black rounded-lg bg-yellow-50">
                      <p className="font-bold">Campos automáticos:</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <CustomCheckbox
                          label="Autor"
                          checked={autoFields.author}
                          onChange={() =>
                            setAutoFields((p) => ({
                              ...p,
                              author: !p.author,
                            }))
                          }
                        />
                        <CustomCheckbox
                          label="Título"
                          checked={autoFields.title}
                          onChange={() =>
                            setAutoFields((p) => ({
                              ...p,
                              title: !p.title,
                            }))
                          }
                        />
                        <CustomCheckbox
                          label="Desc."
                          checked={autoFields.description}
                          onChange={() =>
                            setAutoFields((p) => ({
                              ...p,
                              description: !p.description,
                            }))
                          }
                        />
                        <CustomCheckbox
                          label="Tags"
                          checked={autoFields.tags}
                          onChange={() =>
                            setAutoFields((p) => ({
                              ...p,
                              tags: !p.tags,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadatos */}
                <div>
                  <FileMetadataForm
                    metadata={getCurrentFileMetadata()!}
                    onUpdate={(upd) => updateFileMetadata(currentFileId, upd)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <BrutalButton variant="gray" onClick={() => setStep(2)}>
                Atrás
              </BrutalButton>
              <BrutalButton variant="green" onClick={handleSaveAllMetadata}>
                {isProcessing ? "Guardando..." : "Guardar metadatos"}
              </BrutalButton>
            </div>
          </>
        )}

        {/* STEP 4: Final (Opcional) */}
        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold">¡Proceso Completo!</h2>
            <p>Has terminado todas las etapas.</p>
            <BrutalButton variant="red" onClick={() => setStep(1)}>
              Volver al inicio
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

/** Componente interno para renderizar vista previa de distintos tipos de archivo */
function PreviewBlock({ file }: { file: LocalFile }) {
  if (!file) return null;
  const mainType = file.type.split("/")[0];
  const fileURL = file.filePath
    ? `${process.env.NEXT_PUBLIC_API_URL}/files/${file.filePath}`
    : URL.createObjectURL(file.file);

  if (mainType === "image") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <img
          src={fileURL}
          alt={file.file.name}
          className="max-h-64 max-w-full mx-auto object-contain"
        />
      </div>
    );
  } else if (mainType === "video") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <video controls className="max-h-64 max-w-full mx-auto">
          <source src={fileURL} type={file.type} />
          Tu navegador no soporta este video.
        </video>
      </div>
    );
  } else if (mainType === "audio") {
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100">
        <audio controls className="w-full">
          <source src={fileURL} type={file.type} />
          Tu navegador no soporta este audio.
        </audio>
      </div>
    );
  } else {
    // PDF, JSON, etc.
    return (
      <div className="border-4 border-black rounded-lg p-2 bg-gray-100 flex items-center justify-center">
        <p className="text-center">
          <span className="text-3xl">📄</span>
          <br />
          {file.file.name}
        </p>
      </div>
    );
  }
}

/** Componente para editar metadatos de un archivo */
function FileMetadataForm({
  metadata,
  onUpdate,
}: {
  metadata: FileMetadata;
  onUpdate: (upd: Partial<FileMetadata>) => void;
}) {
  const [newTag, setNewTag] = useState("");

  const removeTag = (tag: string) => {
    onUpdate({
      tags: (metadata.tags || []).filter((t) => t !== tag),
    });
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    onUpdate({
      tags: [...(metadata.tags || []), newTag.trim()],
    });
    setNewTag("");
  };

  return (
    <div className="border-4 border-black p-4 rounded-lg bg-white space-y-4">
      <h4 className="text-xl font-bold">Metadatos</h4>

      <div>
        <label className="font-bold">Autor:</label>
        <input
          type="text"
          className="w-full border-2 border-black rounded p-1 mt-1"
          value={metadata.author || ""}
          onChange={(e) => onUpdate({ author: e.target.value })}
        />
      </div>

      <div>
        <label className="font-bold">Título:</label>
        <input
          type="text"
          className="w-full border-2 border-black rounded p-1 mt-1"
          value={metadata.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      <div>
        <label className="font-bold">Descripción:</label>
        <textarea
          rows={3}
          className="w-full border-2 border-black rounded p-1 mt-1"
          value={metadata.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>

      <div>
        <label className="font-bold">Tags:</label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 border-2 border-black rounded p-1"
            placeholder="Agregar tag..."
          />
          <BrutalButton variant="teal" onClick={addTag}>
            +
          </BrutalButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <div
              key={tag}
              className="bg-blue-200 border-2 border-black rounded px-2 flex items-center"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {metadata.extractedText && (
        <div>
          <label className="font-bold">Texto Extraído:</label>
          <div className="mt-1 p-2 border-2 border-black rounded bg-gray-100 max-h-40 overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm">
              {metadata.extractedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
