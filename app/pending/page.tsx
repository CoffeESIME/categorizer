"use client";

import { useEffect, useState } from "react";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { useFileStore } from "../store/filestore";
import categorizerAPI from "../utils/categorizerAPI";
import { useRouter } from "next/navigation";

export default function PendingFilesList() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);
  const updateFile = useFileStore((state) => state.updateFile);
  const router = useRouter();
  useEffect(() => {
    const fetchPendingFiles = async () => {
      setLoading(true);
      try {
        const filesPen = await categorizerAPI.getFiles({ processed: false });
        setFiles(filesPen);
      } catch (error) {
        console.error("Error fetching pending files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFiles();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleProcessSelected = () => {
    for (let i = 0; i < selectedIds.length; i++) {
      const file = files.find((f) => f.id === selectedIds[i]);
      if (file) {
        updateFile(file.id, { selected: true });
      }
    }
    router.push("/processing");
  };
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Pending Files" variant="neobrutalism" />
      <div className="max-w-3xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Archivos Pendientes</h2>
          {loading ? (
            <p>Cargando archivos pendientes...</p>
          ) : files.length === 0 ? (
            <p>No hay archivos pendientes.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between p-2 border rounded bg-white w-full"
                >
                  <div className="flex items-center max-w-1/2">
                    <CustomCheckbox
                      checked={selectedIds.includes(file.id)}
                      onChange={() => toggleSelection(file.id)}
                      label={file.original_name}
                    />
                  </div>
                  <span className="text-sm text-gray-500 px-2">
                    {file.file_type}
                  </span>
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
      </div>
      <div className="mt-4 flex justify-center">
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>
    </div>
  );
}
