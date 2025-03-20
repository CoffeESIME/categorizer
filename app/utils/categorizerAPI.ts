import axios from "axios";
import { FileItem, FileStatus } from "../store/filestore";
import { DocumentNode } from "../visualizer/page";
import { CreateNodeData } from "../components/Graph/NodeForm";

// Tipos base ya existentes
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
  content?: string;
  result?: string;
  ocr_text?: string;
  text?: string;
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
  tags?: string[];
  topics?: string[];
  style?: string;
  color_palette?: string[];
  composition?: string;
}

// Interfaz para OCR
export interface OCRResult {
  text: string;
  confidence?: number;
}

// Tipos extra
export type TaskType = "text" | "image_description" | "ocr";
export type OCRMethod = "tesseract" | "llm";
export type ProcessingMethod = "manual" | "llm" | "ocr";

export interface ProcessLLMUnifiedOptions {
  task: TaskType;
  input_text?: string;
  file_url?: string;
  model: string;
  temperature: number;
  ocr_method?: OCRMethod;
  prompt?: string;
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

  /**
   * Método unificado para procesar entradas con el LLM (texto, descripción de imagen, OCR).
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
      const response = await fetch(`${this.baseUrl}/metadata/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(metadata),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in saveFilesMetadata:", error);
      throw error;
    }
  }

  async getUnconnectedNodes(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/metadata/unconnected-nodes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...this.headers,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Error al obtener nodos no conectados: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error en getUnconnectedNodes:", error);
      throw error;
    }
  }

  // GET /nodes - obtiene los nodos
  async fetchPossibleConnections(): Promise<DocumentNode[]> {
    try {
      const response = await axios.get<DocumentNode[]>(
        `${this.baseUrl}/nodes`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener nodos", error);
      throw error;
    }
  }

  // Función para obtener las conexiones de un nodo específico
  async fetchNodeConnections(nodeId: string): Promise<DocumentNode[]> {
    try {
      const response = await axios.get<DocumentNode[]>(
        `${this.baseUrl}/nodes/${nodeId}/connections`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener las conexiones del nodo", error);
      throw error;
    }
  }
  // POST /nodes - crea o devuelve el nodo si ya existe
  async createOrGetNodeByName(name: string): Promise<DocumentNode> {
    try {
      const response = await axios.post<DocumentNode>(
        `${this.baseUrl}/nodes`,
        { name },
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear/obtener el nodo", error);
      throw error;
    }
  }

  // PATCH /nodes/:nodeId/connections - añade una conexión al nodo
  async updateNodeConnection(
    nodeId: string,
    connectionNodeId: string
  ): Promise<void> {
    try {
      await axios.patch(
        `${this.baseUrl}/nodes/${nodeId}/connections-actions`,
        { connectionNodeId },
        {
          headers: this.headers,
        }
      );
    } catch (error) {
      console.error("Error al actualizar la conexión del nodo", error);
      throw error;
    }
  }

  // DELETE /nodes/:nodeId/connections/:connectionNodeId - elimina la conexión
  async deleteNodeConnection(
    nodeId: string,
    connectionNodeId: string
  ): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/nodes/${nodeId}/connections-actions/${connectionNodeId}`,
        {
          headers: this.headers,
        }
      );
    } catch (error) {
      console.error("Error al eliminar la conexión", error);
      throw error;
    }
  }
  async fetchGraphData(): Promise<{
    nodes: DocumentNode[];
    edges: { source: string; target: string; relation: string }[];
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/graph`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching graph data", error);
      throw error;
    }
  }
  async getNodeTypes(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/node-types`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching graph data", error);
      throw error;
    }
  }
  async createNode(data: CreateNodeData): Promise<any> {
    try {
      if (!data.type) {
        throw new Error("El tipo de nodo es requerido");
      }
      // Construir el payload usando el id del tipo para que coincida con los ALLOWED_TYPES del backend.
      const payload = {
        type: data.type.id, // Ej: "author", "image", etc.
        properties: data.properties,
      };
      const response = await axios.post(
        `${this.baseUrl}/nodes/create-node`,
        payload,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating node", error);
      throw error;
    }
  }
}

const categorizerAPI = new CategorizerAPI();
export default categorizerAPI;
