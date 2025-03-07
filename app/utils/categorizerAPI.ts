// src/lib/categorizerAPI.ts

import axios, { AxiosRequestConfig } from "axios";

// Definición de tipos base
export interface FileMetadata {
  original_name: string | undefined;
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  tags: string[];
  categories: string[];
  description?: string;
  customFields?: Record<string, any>;
  embeddings?: boolean;
  processed?: boolean;
}

export interface GraphNode {
  id: string;
  type: string; // 'file', 'category', 'tag', 'concept', etc.
  name: string;
  metadata?: Record<string, any>;
}

export interface GraphConnection {
  source: string;
  target: string;
  type: string; // 'contains', 'related', 'similar', etc.
  weight: number;
  metadata?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  connections: GraphConnection[];
}

export interface LLMChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMChatResponse {
  message: LLMChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  sources?: {
    filePath: string;
    fileName: string;
    relevance: number;
    snippet: string;
  }[];
}

export interface ProcessingOptions {
  extractText?: boolean;
  generateEmbeddings?: boolean;
  extractMetadata?: boolean;
  categorize?: boolean;
  summarize?: boolean;
  generateTags?: boolean;
  findConnections?: boolean;
}

export interface SearchParams {
  query: string;
  fileTypes?: string[];
  tags?: string[];
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

type ProcessLLMOptions = {
  extractAuthor: boolean;
  extractTitle: boolean;
  extractDescription: boolean;
  extractTags: boolean;
};

type ProcessLLMResult = {
  author?: string;
  title?: string;
  description?: string;
  tags?: string[];
  extractedText?: string;
};

type OCRResult = {
  text: string;
  confidence?: number;
};

// Clase principal para API del categorizador
class CategorizerAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CATEGORIZER_URL!;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  // Establecer token de autenticación si es necesario
  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  // Métodos relacionados con archivos
  // --------------------------------

  /**
   * Sube múltiples archivos al servidor
   * @param files Lista de archivos a subir
   * @param options Opciones de procesamiento inicial
   * @returns Información de los archivos subidos con rutas
   */
  async uploadFiles(
    files: File[],
    options?: ProcessingOptions
  ): Promise<FileMetadata[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    if (options) {
      formData.append("options", JSON.stringify(options));
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/files/upload/`,
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

  /**
   * Obtiene la lista de archivos de acuerdo a filtros
   * @param params Parámetros de filtrado
   * @returns Lista de metadatos de archivos
   */
  async getFiles(params?: {
    types?: string[];
    processed?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
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
   * Obtiene detalles de un archivo específico
   * @param fileId ID del archivo
   * @returns Metadatos completos del archivo
   */
  async getFileDetails(fileId: string): Promise<FileMetadata> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileId}`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting file details for ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina archivos del sistema
   * @param fileIds Array de IDs de archivos a eliminar
   * @returns Resultado de la operación
   */
  async deleteFiles(
    fileIds: string[]
  ): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/files`, {
        data: { fileIds },
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting files:", error);
      throw error;
    }
  }

  // Métodos de metadatos
  // --------------------------------

  /**
   * Actualiza los metadatos de un archivo
   * @param fileId ID del archivo
   * @param metadata Metadatos a actualizar
   * @returns Metadatos actualizados
   */
  async updateFileMetadata(
    fileId: string,
    metadata: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/files/${fileId}/metadata`,
        metadata,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating metadata for ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza metadatos de múltiples archivos en lote
   * @param updates Array de actualizaciones con ID y metadatos
   * @returns Resultado de la operación
   */
  async batchUpdateMetadata(
    updates: Array<{ fileId: string; metadata: Partial<FileMetadata> }>
  ): Promise<{ success: boolean; updatedCount: number }> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/files/metadata/batch`,
        { updates },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error batch updating metadata:", error);
      throw error;
    }
  }

  /**
   * Genera metadatos automáticamente para archivos usando el LLM integrado
   * @param fileIds IDs de archivos para generar metadatos
   * @param options Opciones de generación (tags, categorías, descripción, etc)
   * @returns Metadatos generados
   */
  async generateMetadata(
    fileIds: string[],
    options: {
      generateTags?: boolean;
      generateCategories?: boolean;
      generateDescription?: boolean;
      extractExif?: boolean;
    }
  ): Promise<Array<{ fileId: string; metadata: Partial<FileMetadata> }>> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/files/metadata/generate`,
        { fileIds, options },
        { headers: this.headers }
      );
      return response.data.results;
    } catch (error) {
      console.error("Error generating metadata:", error);
      throw error;
    }
  }

  // Métodos de procesamiento
  // --------------------------------

  /**
   * Solicita el procesamiento de archivos (extracción de texto, generación de embeddings, etc)
   * @param fileIds IDs de archivos a procesar
   * @param options Opciones de procesamiento
   * @returns Estado del procesamiento
   */
  async processFiles(
    fileIds: string[],
    options: ProcessingOptions
  ): Promise<{ success: boolean; jobId: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/files/process`,
        { fileIds, options },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error processing files:", error);
      throw error;
    }
  }

  // Métodos de RAG y consulta
  // --------------------------------

  /**
   * Envía una pregunta al LLM con contexto de los documentos indexados (RAG)
   * @param messages Historial de mensajes de la conversación
   * @param options Opciones de consulta (archivos a incluir, etc)
   * @returns Respuesta del LLM con fuentes
   */
  async chatWithLLM(
    messages: LLMChatMessage[],
    options?: {
      includeSources?: boolean;
      maxSources?: number;
      restrictToFileIds?: string[];
      restrictToCategories?: string[];
      restrictToTags?: string[];
      temperature?: number;
    }
  ): Promise<LLMChatResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rag/chat`,
        { messages, options },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error chatting with LLM:", error);
      throw error;
    }
  }

  /**
   * Realiza una búsqueda semántica en los archivos indexados
   * @param params Parámetros de búsqueda
   * @returns Resultados de búsqueda ordenados por relevancia
   */
  async semanticSearch(params: SearchParams): Promise<{
    results: Array<{
      file: FileMetadata;
      relevance: number;
      snippet?: string;
    }>;
    totalResults: number;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/rag/search`, params, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error performing semantic search:", error);
      throw error;
    }
  }

  // Métodos de grafo de conocimiento
  // --------------------------------

  /**
   * Obtiene las conexiones de grafo para los elementos seleccionados
   * @param nodeIds IDs de nodos para incluir (archivos, categorías, tags)
   * @param depth Profundidad de conexiones a explorar
   * @returns Datos del grafo con nodos y conexiones
   */
  async getGraphConnections(
    nodeIds: string[],
    depth: number = 1
  ): Promise<GraphData> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/graph/connections`,
        { nodeIds, depth },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting graph connections:", error);
      throw error;
    }
  }

  /**
   * Encuentra nodos similares o relacionados a los proporcionados
   * @param nodeId ID del nodo de referencia
   * @param nodeType Tipo de nodos a recomendar
   * @param limit Cantidad máxima de recomendaciones
   * @returns Lista de nodos recomendados con puntuación
   */
  async getRecommendedNodes(
    nodeId: string,
    nodeType: "file" | "tag" | "category",
    limit: number = 10
  ): Promise<Array<{ node: GraphNode; score: number }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/graph/recommend`, {
        params: { nodeId, nodeType, limit },
        headers: this.headers,
      });
      return response.data.recommendations;
    } catch (error) {
      console.error("Error getting node recommendations:", error);
      throw error;
    }
  }

  /**
   * Crea una conexión manual entre dos nodos
   * @param connection Datos de la conexión a crear
   * @returns Conexión creada con ID
   */
  async createNodeConnection(
    connection: Omit<GraphConnection, "id">
  ): Promise<GraphConnection> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/graph/connections/create`,
        connection,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating node connection:", error);
      throw error;
    }
  }

  // Administración de categorías y tags
  // --------------------------------

  /**
   * Obtiene todas las categorías disponibles
   * @returns Lista de categorías con metadatos
   */
  async getCategories(): Promise<
    Array<{ id: string; name: string; count: number }>
  > {
    try {
      const response = await axios.get(`${this.baseUrl}/categories`, {
        headers: this.headers,
      });
      return response.data.categories;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los tags disponibles
   * @returns Lista de tags con conteo
   */
  async getTags(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`, {
        headers: this.headers,
      });
      return response.data.tags;
    } catch (error) {
      console.error("Error getting tags:", error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * @param name Nombre de la categoría
   * @param parentId ID de categoría padre (opcional)
   * @returns Categoría creada
   */
  async createCategory(
    name: string,
    parentId?: string
  ): Promise<{ id: string; name: string; parentId?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/categories`,
        { name, parentId },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // Exportación e importación de datos
  // --------------------------------

  /**
   * Exporta toda la base de conocimiento o parte de ella
   * @param options Opciones de exportación
   * @returns URL para descargar el archivo exportado
   */
  async exportKnowledgeBase(options?: {
    includeFiles?: boolean;
    includeMetadata?: boolean;
    includeGraph?: boolean;
    fileIds?: string[];
  }): Promise<{ exportUrl: string; jobId: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/export`,
        options || {},
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting knowledge base:", error);
      throw error;
    }
  }

  /**
   * Importa datos a la base de conocimiento
   * @param importFile Archivo de importación
   * @returns Resumen de la importación
   */
  async importKnowledgeBase(importFile: File): Promise<{
    success: boolean;
    imported: {
      files: number;
      categories: number;
      tags: number;
      connections: number;
    };
    jobId: string;
  }> {
    const formData = new FormData();
    formData.append("importFile", importFile);

    try {
      const response = await axios.post(`${this.baseUrl}/import`, formData, {
        headers: {
          ...this.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing knowledge base:", error);
      throw error;
    }
  }

  // Estadísticas del sistema
  // --------------------------------

  /**
   * Obtiene estadísticas generales del sistema
   * @returns Estadísticas del sistema
   */
  async getSystemStats(): Promise<{
    totalFiles: number;
    totalCategories: number;
    totalTags: number;
    totalConnections: number;
    fileTypeDistribution: Record<string, number>;
    storageUsed: number;
    processingQueue: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting system stats:", error);
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
          body: JSON.stringify({
            filePath,
            options,
          }),
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

  // Procesar imagen con OCR
  async processImageWithOCR(filePath: string): Promise<OCRResult> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process/ocr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filePath,
          }),
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

  // Guardar metadatos de múltiples archivos
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

  // Extraer contenido de un archivo JSON
  async extractJsonContent(filePath: string): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process/json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filePath,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en extractJsonContent:", error);
      throw error;
    }
  }
}

// Exportar una instancia por defecto
const categorizerAPI = new CategorizerAPI();
export default categorizerAPI;
