"use client";
import { useEffect, useState } from "react";
import categorizerAPI, { FileMetadata } from "../utils/categorizerAPI";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";

// Componente para visualizar y gestionar archivos pendientes
export default function PendingFilesList() {
  const [pendingFiles, setPendingFiles] = useState<FileMetadata[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Solicitar archivos pendientes al montar el componente
  useEffect(() => {
    const fetchPendingFiles = async () => {
      setLoading(true);
      try {
        // Suponemos que pending significa processed = false
        const files = await categorizerAPI.getFiles({ processed: false });
        console.log(files);
        setPendingFiles(files);
      } catch (error) {
        console.error("Error fetching pending files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFiles();
  }, []);

  // Manejar la selección de un archivo
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Acción sobre los archivos seleccionados
  const handleProcessSelected = () => {
    // Aquí podrías redirigir al usuario, llamar a otra API, etc.
    console.log("Archivos seleccionados para procesar:", selectedIds);
    // Ejemplo: redirigir o actualizar el estado global de Zustand
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Archivos Pendientes</h2>
      {loading ? (
        <p>Cargando archivos pendientes...</p>
      ) : pendingFiles.length === 0 ? (
        <p>No hay archivos pendientes.</p>
      ) : (
        <ul className="space-y-2">
          {pendingFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center">
                <CustomCheckbox
                  checked={selectedIds.includes(file.id)}
                  onChange={() => toggleSelection(file.id)}
                  label={file.original_name}
                />
              </div>
              <span className="text-sm text-gray-500">{file.fileType}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <BrutalButton
          onClick={handleProcessSelected}
          disabled={selectedIds.length === 0}
        >
          Procesar Seleccionados
        </BrutalButton>
      </div>
    </div>
  );
}
