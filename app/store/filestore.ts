// src/store/fileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface FileItem {
  filePath: any;
  file: File;
  id: string;
  file_url?: string;
  selected: boolean;
  type: string;
  original_name?: string;
}

interface FileStore {
  files: FileItem[];
  addFiles: (newFiles: FileItem[]) => void;
  updateFilePath: (id: string, path: string) => void;
  clearFiles: () => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: (selected: boolean) => void;
  getSelectedFiles: () => FileItem[];
  filterByType: (type: string) => FileItem[];
}

// Store de Zustand con persistencia
export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      addFiles: (newFiles) =>
        set((state) => ({
          files: [...state.files, ...newFiles],
        })),
      updateFilePath: (id, path) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, filePath: path } : file
          ),
        })),
      clearFiles: () => set({ files: [] }),
      toggleSelection: (id) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, selected: !file.selected } : file
          ),
        })),
      toggleAllSelection: (selected) =>
        set((state) => ({
          files: state.files.map((file) => ({ ...file, selected })),
        })),
      getSelectedFiles: () => get().files.filter((file) => file.selected),
      filterByType: (type) =>
        get().files.filter((file) =>
          type === "all" ? true : file.type.startsWith(type)
        ),
    }),
    {
      name: "file-storage",
      partialize: (state) => ({ files: state.files.filter((f) => f.file_url) }),
    }
  )
);
