export interface RelationshipProperty {
  comment?: string;
  confidence: number;
  weight: number;
  createdBy?: string;
  createdAt?: string;
}

export interface RelationshipType {
  id: string;
  name: string;
  description: string;
  validSourceTypes?: string[];
  validTargetTypes?: string[];
}

// ... (RelationshipProperty y DEFAULT_RELATIONSHIP_PROPERTIES se mantienen igual)

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
    // Sin validSourceTypes ni validTargetTypes para permitir cualquier conexión
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

  // --- Nuevas opciones de relaciones ---
  {
    id: "SPEAKS_LANGUAGE", // Ejemplo para tu caso: author -> speaks_language -> language
    name: "Habla Idioma",
    description:
      "Indica un idioma que el autor conoce o utiliza para comunicarse o escribir.",
    validSourceTypes: ["author"],
    validTargetTypes: ["language"],
  },
  {
    id: "INSPIRED_BY",
    name: "Inspirado por",
    description:
      "Indica que una entidad (obra, autor) ha sido inspirada o influenciada por otra entidad.",
    validSourceTypes: ["book", "quote", "image", "video", "music", "author"],
    validTargetTypes: [
      "book",
      "author",
      "quote",
      "image",
      "video",
      "music",
      "tag",
      "country",
    ],
  },
  {
    id: "ADAPTED_TO_FORM",
    name: "Adaptado a Forma",
    description:
      "Indica que una obra ha sido adaptada a otro formato o medio (ej. libro a película, poema a canción).",
    validSourceTypes: ["book", "quote", "music"],
    validTargetTypes: ["video", "music", "book", "image"], // image podría ser una novela gráfica
  },
  {
    id: "HAS_THEME",
    name: "Trata Sobre / Tiene Tema",
    description:
      "Conecta una obra o autor con un tema central o recurrente, representado por una etiqueta.",
    validSourceTypes: ["book", "quote", "image", "video", "music", "author"],
    validTargetTypes: ["tag"],
  },
  {
    id: "SET_IN_LOCATION",
    name: "Ambientado en",
    description:
      "Indica el lugar geográfico (país, o una etiqueta para ciudad/lugar ficticio) donde se desarrolla la trama o contexto principal de una obra.",
    validSourceTypes: ["book", "video", "music", "quote", "image"],
    validTargetTypes: ["country", "tag"], // "tag" puede usarse para localizaciones más específicas o ficticias
  },
  {
    id: "TRANSLATED_TO",
    name: "Traducido a",
    description: "Indica el idioma al que ha sido traducida una obra o cita.",
    validSourceTypes: ["book", "quote"],
    validTargetTypes: ["language"],
  },
  {
    id: "TRANSLATED_BY",
    name: "Traducido por",
    description: "Indica el autor que realizó la traducción de una obra.",
    validSourceTypes: ["book"],
    validTargetTypes: ["author"], // Asumiendo que los traductores se gestionan como autores
  },
  {
    id: "FEATURES_ARTIST",
    name: "Presenta Artista",
    description:
      "Indica un artista (actor, músico, etc.) que participa o es destacado en una obra.",
    validSourceTypes: ["video", "music", "image"], // image podría ser una performance fotografiada
    validTargetTypes: ["author"], // Asumiendo que artistas (actores, músicos) se gestionan como autores
  },
];

export function getValidRelationships(
  sourceType: string,
  targetType: string
): RelationshipType[] {
  return DEFAULT_RELATIONSHIPS.filter((rel) => {
    if (!rel.validSourceTypes && !rel.validTargetTypes) {
      return true;
    }

    const validSource =
      !rel.validSourceTypes || rel.validSourceTypes.includes(sourceType);
    const validTarget =
      !rel.validTargetTypes || rel.validTargetTypes.includes(targetType);

    return validSource && validTarget;
  });
}

export const DEFAULT_RELATIONSHIP_PROPERTIES: RelationshipProperty = {
  confidence: 1,
  weight: 0,
  comment: "",
};
