import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FileStatus = "pending" | "uploaded" | "categorized";

export interface FileItem {
  id: string;
  file?: File;
  original_name: string;
  filePath?: string;
  file_url?: string;
  file_type?: string;
  selected?: boolean;
  status: FileStatus;
}

interface FileStore {
  files: FileItem[];
  // Funciones básicas
  addFiles: (newFiles: FileItem[]) => void;
  setFiles: (newFiles: FileItem[]) => void;
  updateFilePath: (id: string, path: string) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: (selected: boolean) => void;
  // Selectores
  getSelectedFiles: () => FileItem[];
  filterByType: (type: string) => FileItem[];
  getPendingFiles: () => FileItem[];
  getFileById: (id: string) => FileItem | undefined;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      addFiles: (newFiles) =>
        set((state) => ({
          files: [...state.files, ...newFiles],
        })),
      setFiles: (newFiles) =>
        set((state) => ({
          files: [...newFiles],
        })),
      updateFilePath: (id, path) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, filePath: path } : file
          ),
        })),
      updateFile: (id, updates) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, ...updates } : file
          ),
        })),
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
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
          type === "all" ? true : file.file_type!.startsWith(type)
        ),
      getPendingFiles: () =>
        get().files.filter((file) => file.status === "pending"),
      getFileById: (id) => get().files.find((file) => file.id === id),
    }),
    {
      name: "file-storage",
      partialize: (state) => ({
        //files: state.files.filter((f) => !!f.filePath),
      }),
    }
  )
);
