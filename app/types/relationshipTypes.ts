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
export const DEFAULT_RELATIONSHIPS: RelationshipType[] = [
  // --- Relaciones Fundamentales de Contenido ---
  {
    id: "AUTHORED_BY",
    name: "Autoría de",
    description: "Indica que un recurso fue creado por una persona.",
    validSourceTypes: [
      "book",
      "quote",
      "image",
      "video",
      "music",
      "source",
      "post",
    ],
    validTargetTypes: ["person", "author"],
  },
  {
    id: "IS_ABOUT",
    name: "Trata sobre",
    description:
      "La relación semántica principal. Indica el tema o concepto central de un recurso.",
    validSourceTypes: [
      "book",
      "quote",
      "image",
      "video",
      "music",
      "source",
      "project",
      "post",
      "event",
    ],
    validTargetTypes: ["concept", "tag"],
  },
  {
    id: "MENTIONS",
    name: "Menciona a",
    description:
      "Indica que un recurso hace referencia a una entidad (persona, concepto, etc.).",
    validSourceTypes: ["book", "quote", "video", "source", "post"],
    validTargetTypes: [
      "person",
      "author",
      "concept",
      "event",
      "book",
      "organization",
      "source",
      "post",
    ],
  },
  {
    id: "TAGGED_AS",
    name: "Etiquetado como",
    description: "Asigna una etiqueta descriptiva (folksonomía) a una entidad.",
    validSourceTypes: [
      "book",
      "quote",
      "image",
      "video",
      "music",
      "author",
      "person",
      "project",
      "event",
      "concept",
      "organization",
      "source",
      "post",
    ],
    validTargetTypes: ["tag"],
  },

  // --- Relaciones Específicas para Tumblr, Citas y Medios ---
  {
    id: "QUOTES",
    name: "Cita a",
    description: "Indica que un post o recurso contiene una cita específica.",
    validSourceTypes: ["post", "book", "source", "video"],
    validTargetTypes: ["quote"],
  },
  {
    id: "REPRESENTS",
    name: "Representa a",
    description:
      "Conecta una etiqueta (folksonomía) con un concepto formal (ontología).",
    validSourceTypes: ["tag"],
    validTargetTypes: ["concept"],
  },
  {
    id: "ADAPTED_TO_FORM",
    name: "Adaptado a Forma",
    description:
      "Indica que una obra ha sido adaptada a otro formato (ej. libro a película).",
    validSourceTypes: ["book", "quote", "music", "source"],
    validTargetTypes: ["video", "music", "book", "image", "post"],
  },
  {
    id: "FEATURES_ARTIST",
    name: "Presenta Artista",
    description:
      "Indica una persona (actor, músico) que participa en una obra.",
    validSourceTypes: ["video", "music", "image"],
    validTargetTypes: ["person", "author"],
  },

  // --- Relaciones de Influencia y Crítica ---
  {
    id: "INFLUENCED_BY",
    name: "Influenciado por",
    description:
      "Una entidad (persona, obra, proyecto) fue influenciada por otra.",
    validSourceTypes: [
      "person",
      "author",
      "book",
      "concept",
      "organization",
      "project",
      "post",
    ],
    validTargetTypes: [
      "person",
      "author",
      "book",
      "concept",
      "event",
      "source",
    ],
  },
  {
    id: "CRITICIZES",
    name: "Critica a",
    description:
      "Una fuente expresa una crítica hacia un concepto, persona u obra.",
    validSourceTypes: ["book", "quote", "source", "post"],
    validTargetTypes: ["concept", "person", "author", "book", "source", "post"],
  },

  // --- Relaciones Estructurales y de Jerarquía ---
  {
    id: "PART_OF",
    name: "Parte de",
    description:
      "Indica que un elemento es un componente de un conjunto mayor.",
    validSourceTypes: ["quote", "music", "image", "video", "source", "post"],
    validTargetTypes: ["book", "music", "video", "project", "source", "post"],
  },
  {
    id: "PART_OF_PROJECT",
    name: "Parte del Proyecto",
    description: "Conecta un recurso o idea a un proyecto específico.",
    validSourceTypes: [
      "book",
      "quote",
      "image",
      "video",
      "music",
      "source",
      "concept",
      "person",
      "post",
    ],
    validTargetTypes: ["project"],
  },

  // --- Relaciones de Contexto (Lugar, Idioma, Organización) ---
  {
    id: "AFFILIATED_WITH",
    name: "Afiliado con",
    description:
      "Conecta una persona con una organización (ej. empleo, universidad).",
    validSourceTypes: ["person", "author"],
    validTargetTypes: ["organization"],
  },
  {
    id: "PUBLISHED_BY",
    name: "Publicado por",
    description: "Indica la organización que publicó una obra.",
    validSourceTypes: ["book", "music", "source"],
    validTargetTypes: ["organization"],
  },
  {
    id: "CREATED_IN",
    name: "Creado en",
    description: "Indica el lugar de origen o creación de una entidad.",
    validSourceTypes: [
      "book",
      "image",
      "video",
      "music",
      "author",
      "person",
      "event",
      "organization",
      "project",
      "source",
      "post",
    ],
    validTargetTypes: ["country"],
  },
  {
    id: "SET_IN_LOCATION",
    name: "Ambientado en",
    description:
      "Indica el lugar geográfico donde se desarrolla la trama de una obra.",
    validSourceTypes: ["book", "video", "music", "quote", "image", "post"],
    validTargetTypes: ["country", "tag"],
  },
  {
    id: "ATTENDED",
    name: "Asistió a",
    description: "Relaciona a una persona con un evento al que asistió.",
    validSourceTypes: ["person", "author"],
    validTargetTypes: ["event"],
  },
  {
    id: "WRITTEN_IN",
    name: "Escrito en",
    description: "Indica el idioma original de un material escrito.",
    validSourceTypes: ["book", "quote", "source", "post"],
    validTargetTypes: ["language"],
  },
  {
    id: "TRANSLATED_TO",
    name: "Traducido a",
    description: "Indica el idioma al que ha sido traducida una obra o cita.",
    validSourceTypes: ["book", "quote", "source", "post"],
    validTargetTypes: ["language"],
  },
  {
    id: "TRANSLATED_BY",
    name: "Traducido por",
    description: "Indica la persona que realizó la traducción de una obra.",
    validSourceTypes: ["book", "source", "post"],
    validTargetTypes: ["person", "author"],
  },
  {
    id: "SPEAKS_LANGUAGE",
    name: "Habla Idioma",
    description: "Indica un idioma que una persona conoce o utiliza.",
    validSourceTypes: ["person", "author"],
    validTargetTypes: ["language"],
  },

  // --- Relaciones Genéricas y de Pertenencia ---
  {
    id: "BELONGS_TO",
    name: "Pertenece a",
    description:
      "Relación genérica de pertenencia. Usar si no aplica una más específica.",
    validSourceTypes: [
      "book",
      "image",
      "video",
      "music",
      "quote",
      "person",
      "project",
      "organization",
      "post",
    ],
    validTargetTypes: ["tag", "language", "country"],
  },
  {
    id: "REFERENCES",
    name: "Referencia a",
    description:
      "Relación genérica de referencia. Se recomienda usar 'MENTIONS' o 'QUOTES' por ser más específicos.",
    validSourceTypes: ["book", "quote", "image", "video", "source", "post"],
    validTargetTypes: [
      "book",
      "author",
      "person",
      "quote",
      "image",
      "video",
      "concept",
      "event",
      "organization",
      "source",
      "post",
    ],
  },
  {
    id: "RELATES_TO",
    name: "Relacionado con",
    description:
      "La relación más genérica. Usar como último recurso cuando ninguna otra aplique.",
    // Sin `validSourceTypes` ni `validTargetTypes` para permitir cualquier conexión.
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
