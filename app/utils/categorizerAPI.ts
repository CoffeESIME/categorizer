// src/utils/categorizerAPI.ts
import axios from "axios";
import { FileItem, FileStatus } from "../store/filestore";

// Tipos base
export interface FileMetadata {
  file_type: string;
  location: string;
  original_name: string;
  id: string;
  file_url: string;
  upload_date: string;
  status: FileStatus;
}

export interface ProcessLLMOptions {
  extractAuthor: boolean;
  extractTitle: boolean;
  extractDescription: boolean;
  extractTags: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ProcessLLMResult {
  author?: string;
  title?: string;
  description?: string;
  tags?: string[];
  extractedText?: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
}

class CategorizerAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CATEGORIZER_URL + "/api" || "";
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  async uploadFiles(files: FileItem[]): Promise<FileMetadata[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.file!);
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/files/upload`,
        formData,
        {
          headers: {
            ...this.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.files;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  }

  async getFiles(params?: {
    types?: string[];
    processed?: boolean;
  }): Promise<FileMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/files`, {
        params,
        headers: this.headers,
      });
      return response.data.files;
    } catch (error) {
      console.error("Error getting files:", error);
      throw error;
    }
  }

  async processFileWithLLM(
    filePath: string,
    options: ProcessLLMOptions
  ): Promise<ProcessLLMResult> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process/llm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath, options }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en processFileWithLLM:", error);
      throw error;
    }
  }

  async processImageWithOCR(filePath: string): Promise<OCRResult> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process/ocr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en processImageWithOCR:", error);
      throw error;
    }
  }

  async saveFilesMetadata(metadata: any[]): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/metadata/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadata }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error en saveFilesMetadata:", error);
      throw error;
    }
  }
}

const categorizerAPI = new CategorizerAPI();
export default categorizerAPI;
