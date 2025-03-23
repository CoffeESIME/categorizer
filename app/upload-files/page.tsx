"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import categorizerAPI from "../utils/categorizerAPI";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { FileItem, useFileStore } from "../store/filestore";
import { useRouter } from "next/navigation";

export default function MultipleFileUpload() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const {
    files,
    addFiles,
    updateFilePath,
    clearFiles,
    toggleSelection,
    toggleAllSelection,
    getSelectedFiles,
    filterByType,
    setFiles,
  } = useFileStore();

  useEffect(() => {
    setFiles([]);
    setStep(1);
  }, []);
  const router = useRouter();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileItem[] = acceptedFiles.map((file) => ({
        file,
        id: file.name,
        selected: false,
        original_name: file.name,
        status: "pending",
        file_type: file.type,
      }));
      addFiles(newFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const fileObjects = files;
      const uploadedFiles = await categorizerAPI.uploadFiles(fileObjects);
      uploadedFiles.forEach((fileMetadata) => {
        const matchingFile = files.find(
          (f) =>
            f.original_name.toLowerCase().trim() ===
            fileMetadata.original_name.toLocaleLowerCase().trim()
        );
        if (matchingFile) {
          updateFilePath(matchingFile.id, fileMetadata.location);
        }
      });

      setStep(2);
    } catch (error) {
      console.error("Error al subir archivos:", error);
      alert("Error al subir archivos. Por favor intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const getFilteredFiles = () => filterByType(filterType);

  const getUniqueFileTypes = () => {
    const types = new Set<string>();
    files.forEach((file) => {
      const mainType = file.file_type!.split("/")[0];
      types.add(mainType);
    });
    return Array.from(types);
  };

  const handleProcessFiles = async () => {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) {
      alert("Selecciona al menos un archivo para procesar");
      return;
    }
    router.push("/processing");
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Upload Multiple Files" variant="neobrutalism" />
      <div className="max-w-3xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Paso 1: Seleccionar Archivos
            </h2>
            <div
              {...getRootProps()}
              className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
                isDragActive ? "bg-green-300" : "bg-blue-300"
              }`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <p>{files.length} archivos seleccionados</p>
              ) : (
                <p className="text-lg font-bold">
                  Arrastra y suelta archivos, o haz click para seleccionar
                </p>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-4 border-2 border-black p-3 rounded-lg max-h-60 overflow-y-auto">
                <h3 className="text-lg font-bold mb-2">
                  Archivos seleccionados:
                </h3>
                <ul className="space-y-2">
                  {files.map((fileItem) => (
                    <li
                      key={fileItem.id}
                      className="flex items-center justify-between p-2 border-b border-gray-300"
                    >
                      <span className="text-sm font-medium truncate max-w-xs">
                        {fileItem.file!.name} (
                        {(fileItem.file!.size / 1024).toFixed(2)} KB)
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {fileItem.file_type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <BrutalButton
                onClick={() => clearFiles()}
                disabled={files.length === 0}
                variant="red"
              >
                Limpiar Todo
              </BrutalButton>
              <BrutalButton
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                variant="blue"
              >
                {uploading ? "Subiendo..." : "Subir Archivos"}
              </BrutalButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <BrutalButton
                onClick={() => setStep(1)}
                variant="gray"
                className="text-black"
              >
                Volver
              </BrutalButton>
              <h2 className="text-2xl font-bold">
                Paso 2: Seleccionar Archivos para Procesar
              </h2>
            </div>

            <div className="mb-4 flex items-center space-x-2">
              <span className="font-medium">Filtrar por tipo:</span>
              <select
                className="p-2 border-3 border-black rounded-lg bg-purple-200"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {getUniqueFileTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <BrutalButton
                onClick={() => toggleAllSelection(true)}
                variant="teal"
                className="ml-auto"
              >
                Seleccionar Todos
              </BrutalButton>
              <BrutalButton
                onClick={() => toggleAllSelection(false)}
                variant="green"
              >
                Deseleccionar Todos
              </BrutalButton>
            </div>

            <div className="border-2 border-black p-3 rounded-lg max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">Archivos disponibles:</h3>
              {getFilteredFiles().length > 0 ? (
                <ul className="space-y-2">
                  {getFilteredFiles().map((fileItem) => (
                    <li
                      key={fileItem.id}
                      className={`flex items-center justify-between p-2 border-b border-gray-300 rounded ${
                        fileItem.selected ? "bg-green-100" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <CustomCheckbox
                          onChange={() => toggleSelection(fileItem.id)}
                          checked={fileItem.selected}
                          label={fileItem.file!.name}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {fileItem.file_type}
                        </span>
                        {fileItem.file_url && (
                          <span className="text-xs bg-green-200 px-2 py-1 rounded">
                            Subido ✓
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4">
                  No hay archivos que coincidan con el filtro seleccionado
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <span className="font-bold">
                {getSelectedFiles().length} de {files.length} archivos
                seleccionados
              </span>
              <BrutalButton
                onClick={handleProcessFiles}
                disabled={getSelectedFiles().length === 0}
                variant="green"
              >
                Procesar Seleccionados
              </BrutalButton>
            </div>
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
