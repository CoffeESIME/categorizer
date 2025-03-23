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
  // etc.
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
