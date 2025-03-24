import axios from "axios";
import { FileItem, FileStatus } from "../store/filestore";
import { DocumentNode, NodeType, CreateNodeData } from "../types/nodeTypes";
import {
  RelationshipType,
  RelationshipProperty,
  DEFAULT_RELATIONSHIP_PROPERTIES,
} from "../types/relationshipTypes";

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

// Interfaz para resultados de procesamiento LLM
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

export interface ProcessLLMUnifiedOptions {
  task: TaskType;
  input_text?: string;
  file_url?: string;
  model: string;
  temperature: number;
  ocr_method?: OCRMethod;
  prompt?: string;
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

// Interfaz para la creación de relaciones
export interface CreateRelationshipData {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  relationshipProperties?: Partial<RelationshipProperty>;
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
  async processTextLLM(options: any): Promise<ProcessLLMResult> {
    try {
      const response = await fetch(`${this.baseUrl}/content/process`, {
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
      console.error("Error in processTextLLM:", error);
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
  async saveTextMetadata(metadata: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/content/metadata/save`, {
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

  // Nuevo método para crear una relación con propiedades adicionales
  async createRelationship(data: CreateRelationshipData): Promise<any> {
    try {
      // Combinamos las propiedades predeterminadas con las proporcionadas
      const relationshipProperties = {
        ...DEFAULT_RELATIONSHIP_PROPERTIES,
        ...data.relationshipProperties,
        createdAt: new Date().toISOString(),
      };

      const payload = {
        sourceId: data.sourceId,
        targetId: data.targetId,
        relationshipType: data.relationshipType,
        relationshipProperties,
      };

      const response = await axios.post(
        `${this.baseUrl}/nodes/create-relationship`,
        payload,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating relationship", error);
      throw error;
    }
  }

  // DELETE /nodes/:nodeId/connections/:connectionNodeId - elimina la conexión
  async deleteNodeConnection(
    nodeId: string,
    connectionNodeId: string,
    relationshipType?: string
  ): Promise<void> {
    try {
      // Si se proporciona un tipo de relación, lo incluimos en la solicitud
      const params = relationshipType ? { relationshipType } : {};

      await axios.delete(
        `${this.baseUrl}/nodes/${nodeId}/connections-actions/${connectionNodeId}`,
        {
          headers: this.headers,
          params,
        }
      );
    } catch (error) {
      console.error("Error al eliminar la conexión", error);
      throw error;
    }
  }

  // Método para obtener los tipos de relaciones disponibles
  async getRelationshipTypes(): Promise<RelationshipType[]> {
    try {
      const response = await axios.get<RelationshipType[]>(
        `${this.baseUrl}/relationship-types`,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching relationship types", error);
      throw error;
    }
  }

  // Método para obtener las relaciones de un nodo
  async getNodeRelationships(nodeId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/nodes/${nodeId}/relationships`,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching node relationships", error);
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
  async getNodeTypes(): Promise<NodeType[]> {
    try {
      const response = await axios.get<NodeType[]>(
        `${this.baseUrl}/node-types`,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching node types", error);
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
  async fetchNodesByType(nodeType: string): Promise<DocumentNode[]> {
    try {
      const response = await axios.get<DocumentNode[]>(
        `${this.baseUrl}/nodes/node-types/${nodeType}`,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nodes by type", error);
      throw error;
    }
  }
}

const categorizerAPI = new CategorizerAPI();
export default categorizerAPI;
