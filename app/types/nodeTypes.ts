// types/nodeTypes.ts

export interface BaseNode {
  id: string;
  labels?: string[];
}

export interface DocumentNode extends BaseNode {
  doc_id: string;
  author?: string;
  title?: string;
  work?: string;
  languages?: string[];
  sentiment_word?: string;
  categories?: string[];
  keywords?: string[];
  content_type?: string;
  tags?: string[];
  topics?: string[];
  style?: string;
  relationshipType?: string;
}

export interface AuthorNode extends BaseNode {
  name: string;
  birthdate?: string;
  bio?: string;
}

export interface CountryNode extends BaseNode {
  name: string;
  iso_code?: string;
}

// Definición de tipo para nodos incluyendo los campos requeridos
export interface NodeField {
  fieldName: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}

export interface NodeType {
  id: string;
  name: string;
  fields: NodeField[];
}

// Datos para la creación de un nodo con tipo específico
export interface CreateNodeData {
  type: NodeType | null;
  properties: Record<string, string>;
}

export interface NodeConnection extends DocumentNode {
  relationshipType: string;
}
