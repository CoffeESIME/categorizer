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

export interface ProcessLLMResult {
  raw_analysis?: any;
  raw?: any;
  error?: any;
  author?: string;
  title?: string;
  description?: string;
  tags?: string[];
  content?: string;
  result?: string;
  ocr_text?: string;
  text?: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
}

// Nuevo tipo unificado para llamar al endpoint
export type TaskType = "text" | "image_description" | "ocr";
export type OCRMethod = "tesseract" | "llm";
export type ProcessingMethod = "manual" | "llm" | "ocr";

export interface ProcessLLMUnifiedOptions {
  task: TaskType; // "text", "image_description" o "ocr"
  input_text?: string;
  file_url?: string;
  model: string;
  temperature: number;
  //max_tokens: number;
  ocr_method?: OCRMethod; // "tesseract" o "llm", solo para task "ocr"
  prompt?: string;
}

class CategorizerAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    // Se utiliza NEXT_PUBLIC_CATEGORIZER_URL para establecer la URL base del API.
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

  /**
   * Método unificado para procesar entradas con el LLM.
   * Se utiliza para:
   * - Procesar texto: task="text" y se debe enviar input_text.
   * - Describir imágenes: task="image_description" y se debe enviar file_url.
   * - Realizar OCR: task="ocr" y se debe enviar file_url, además de ocr_method ("tesseract" o "llm").
   */
  async processLLM(
    options: ProcessLLMUnifiedOptions
  ): Promise<ProcessLLMResult> {
    try {
      const response = await fetch(`${this.baseUrl}/llm/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error in processLLM:", error);
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
            ...this.headers,
          },
          body: JSON.stringify({ metadata }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in saveFilesMetadata:", error);
      throw error;
    }
  }
}

const categorizerAPI = new CategorizerAPI();
export default categorizerAPI;
