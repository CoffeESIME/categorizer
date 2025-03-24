// Tipos de relaciones disponibles por defecto
export interface RelationshipType {
  id: string;
  name: string;
  description: string;
  validSourceTypes?: string[];
  validTargetTypes?: string[];
}

export interface RelationshipProperty {
  comment?: string;
  confidence: number;
  weight: number;
  createdBy?: string;
  createdAt?: string;
}

// Relaciones predefinidas para conectar nodos
export const DEFAULT_RELATIONSHIPS: RelationshipType[] = [
  {
    id: "AUTHORED_BY",
    name: "Autoría",
    description: "Indica que un documento fue creado por un autor",
    validSourceTypes: ["book", "quote", "image", "video", "music"],
    validTargetTypes: ["author"],
  },
  {
    id: "BELONGS_TO",
    name: "Pertenece a",
    description: "Indica que un elemento pertenece a una categoría o conjunto",
    validSourceTypes: ["book", "image", "video", "music", "quote"],
    validTargetTypes: ["tag", "language", "country"],
  },
  {
    id: "CREATED_IN",
    name: "Creado en",
    description: "Indica el lugar de origen o creación",
    validSourceTypes: ["book", "image", "video", "music", "author"],
    validTargetTypes: ["country"],
  },
  {
    id: "RELATES_TO",
    name: "Relacionado con",
    description: "Relación genérica entre dos nodos",
    // Al no especificar tipos, esta relación es válida entre cualquier par de nodos
  },
  {
    id: "REFERENCES",
    name: "Referencia a",
    description: "Indica que un elemento hace referencia a otro",
    validSourceTypes: ["book", "quote", "image", "video"],
    validTargetTypes: ["book", "author", "quote", "image", "video"],
  },
  {
    id: "TAGGED_AS",
    name: "Etiquetado como",
    description: "Asigna una etiqueta descriptiva a un elemento",
    validSourceTypes: ["book", "quote", "image", "video", "music", "author"],
    validTargetTypes: ["tag"],
  },
  {
    id: "PART_OF",
    name: "Parte de",
    description: "Indica que un elemento es parte de una obra mayor",
    validSourceTypes: ["quote", "music", "image", "video"],
    validTargetTypes: ["book", "music", "video"],
  },
  {
    id: "WRITTEN_IN",
    name: "Escrito en",
    description: "Indica el idioma en que está escrito un material",
    validSourceTypes: ["book", "quote"],
    validTargetTypes: ["language"],
  },
];

// Función para obtener relaciones válidas entre dos tipos de nodos
export function getValidRelationships(
  sourceType: string,
  targetType: string
): RelationshipType[] {
  return DEFAULT_RELATIONSHIPS.filter((rel) => {
    // Si no hay tipos específicos, la relación es válida para cualquier par
    if (!rel.validSourceTypes && !rel.validTargetTypes) {
      return true;
    }

    // Si hay tipos específicos, verificar que coincidan
    const validSource =
      !rel.validSourceTypes || rel.validSourceTypes.includes(sourceType);
    const validTarget =
      !rel.validTargetTypes || rel.validTargetTypes.includes(targetType);

    return validSource && validTarget;
  });
}
