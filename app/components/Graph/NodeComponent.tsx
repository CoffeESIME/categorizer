"use client";
import React, { useState, useEffect } from "react";
import { DocumentNode, NodeType } from "@/app/types/nodeTypes";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import { BrutalButton } from "../ButtonComponent/ButtonComponent";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import BrutalSearchSelect from "../BurtalSearchSelectComponent/BrutalSearchComponent";
import categorizerAPI from "@/app/utils/categorizerAPI";
import {
  RelationshipType,
  DEFAULT_RELATIONSHIPS,
  getValidRelationships,
} from "@/app/types/relationshipTypes";

export interface UpdateFieldConfig {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "checkbox" | "textarea";
}

const updateFormConfig: Record<string, UpdateFieldConfig[]> = {
  default: [
    { name: "title", label: "Título", type: "text" },
    { name: "author", label: "Autor", type: "text" },
    { name: "work", label: "Obra", type: "text" },
    { name: "content_type", label: "Tipo de Contenido", type: "text" },
    { name: "languages", label: "Idiomas", type: "text" },
    { name: "sentiment_word", label: "Sentimiento", type: "text" },
    { name: "categories", label: "Categorías", type: "text" },
    { name: "keywords", label: "Palabras clave", type: "text" },
    { name: "tags", label: "Etiquetas", type: "text" },
    { name: "topics", label: "Temas", type: "text" },
    { name: "style", label: "Estilo", type: "text" },
    { name: "labels", label: "Labels", type: "text" },
  ],
  author: [
    { name: "name", label: "Nombre del autor", type: "text" },
    { name: "birthdate", label: "Fecha de nacimiento", type: "date" },
    { name: "bio", label: "Breve biografía", type: "textarea" },
  ],
  image: [
    { name: "title", label: "Título de la imagen", type: "text" },
    { name: "doc_id", label: "Nombre de archivo o ID", type: "text" },
  ],
  video: [
    { name: "title", label: "Título del video", type: "text" },
    { name: "doc_id", label: "Nombre de archivo o ID", type: "text" },
    { name: "duration", label: "Duración (segundos)", type: "number" },
  ],
  book: [
    { name: "title", label: "Título del libro", type: "text" },
    { name: "authorName", label: "Autor del libro", type: "text" },
    { name: "publication_year", label: "Año de publicación", type: "number" },
    { name: "doc_id", label: "Nombre de archivo o ID", type: "text" },
  ],
  country: [
    { name: "name", label: "Nombre del país", type: "text" },
    { name: "iso_code", label: "Código ISO (ej. MX, US)", type: "text" },
  ],
  tag: [
    { name: "name", label: "Nombre de la etiqueta", type: "text" },
    { name: "description", label: "Descripción breve", type: "textarea" },
  ],
  quote: [
    { name: "text", label: "Texto de la cita", type: "textarea" },
    { name: "doc_id", label: "Nombre de archivo o ID", type: "text" },
    {
      name: "allowEmbedding",
      label: "¿Permitir embeddings?",
      type: "checkbox",
    },
  ],
  music: [
    { name: "title", label: "Título de la canción/pieza", type: "text" },
    { name: "doc_id", label: "Nombre de archivo o ID", type: "text" },
    { name: "artist", label: "Artista o banda", type: "text" },
    { name: "on_pc", label: "¿Está almacenada localmente?", type: "checkbox" },
  ],
  language: [
    { name: "name", label: "Nombre del idioma", type: "text" },
    { name: "iso_code", label: "Código del idioma (ej. es, en)", type: "text" },
  ],
};

const searchFieldMapping: Record<string, string> = {
  author: "name",
  image: "title",
  video: "title",
  book: "title",
  country: "name",
  tag: "name",
  quote: "text",
  music: "title",
  language: "name",
};

interface NodeDetailsPanelProps {
  selectedNode: DocumentNode | null;
  onClose: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  selectedNode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"update" | "connect">("update");
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);

  const [currentConnections, setCurrentConnections] = useState<DocumentNode[]>(
    []
  );
  const [possibleConnections, setPossibleConnections] = useState<
    DocumentNode[]
  >([]);

  const [selectedConnectionType, setSelectedConnectionType] =
    useState<string>("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [selectedConnectionDisplay, setSelectedConnectionDisplay] =
    useState<string>("");

  // Estado para el tipo de relación
  const [availableRelationships, setAvailableRelationships] = useState<
    RelationshipType[]
  >([]);
  const [selectedRelationship, setSelectedRelationship] =
    useState<RelationshipType | null>(null);

  // Estado para propiedades de la relación
  const [relationComment, setRelationComment] = useState<string>("");
  const [relationConfidence, setRelationConfidence] = useState<number>(1); // Alta confianza por defecto

  // Valores del formulario de actualización
  const [updateFormValues, setUpdateFormValues] = useState<Record<string, any>>(
    {}
  );

  // Cargar tipos de nodos desde la API
  useEffect(() => {
    async function fetchNodeTypes() {
      try {
        const types: NodeType[] = await categorizerAPI.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error("Error fetching node types", error);
      }
    }
    fetchNodeTypes();
  }, []);

  useEffect(() => {
    if (selectedNode && selectedNode.id) {
      setUpdateFormValues({
        title: selectedNode.title || "",
        author: selectedNode.author || "",
        work: selectedNode.work || "",
        content_type: selectedNode.content_type || "",
        languages: Array.isArray(selectedNode.languages)
          ? selectedNode.languages.join(", ")
          : selectedNode.languages || "",
        sentiment_word: selectedNode.sentiment_word || "",
        categories: Array.isArray(selectedNode.categories)
          ? selectedNode.categories.join(", ")
          : selectedNode.categories || "",
        keywords: Array.isArray(selectedNode.keywords)
          ? selectedNode.keywords.join(", ")
          : selectedNode.keywords || "",
        tags: Array.isArray(selectedNode.tags)
          ? selectedNode.tags.join(", ")
          : selectedNode.tags || "",
        topics: Array.isArray(selectedNode.topics)
          ? selectedNode.topics.join(", ")
          : selectedNode.topics || "",
        style: selectedNode.style || "",
        labels: Array.isArray(selectedNode.labels)
          ? selectedNode.labels.join(", ")
          : selectedNode.labels || "",
        id: selectedNode.id || "",
      });

      // Cargar conexiones existentes
      async function fetchConnections() {
        if (!selectedNode?.id) return; // Verificación adicional

        try {
          const connections = await categorizerAPI.fetchNodeConnections(
            selectedNode.id
          );
          setCurrentConnections(connections);
        } catch (error) {
          console.error("Error al cargar conexiones:", error);
        }
      }

      fetchConnections();
    }
  }, [selectedNode]);

  // Actualizar relaciones disponibles cuando cambian los tipos de nodos
  useEffect(() => {
    if (selectedConnectionType && selectedNode && selectedNode.labels?.length) {
      const sourceType = selectedNode.labels[0].toLowerCase();
      const availableRels = getValidRelationships(
        sourceType,
        selectedConnectionType
      );
      setAvailableRelationships(availableRels);

      // Seleccionar la primera relación por defecto si hay disponibles
      if (availableRels.length > 0) {
        setSelectedRelationship(availableRels[0]);
      } else {
        // Si no hay relaciones específicas, usar RELATES_TO como predeterminada
        const defaultRel = DEFAULT_RELATIONSHIPS.find(
          (r) => r.id === "RELATES_TO"
        );
        setSelectedRelationship(defaultRel || null);
      }
    } else {
      setAvailableRelationships([]);
      setSelectedRelationship(null);
    }
  }, [selectedConnectionType, selectedNode]);

  if (!selectedNode) return null;

  const nodeLabel = selectedNode.labels?.[0]?.toLowerCase() || "default";
  const currentFormFields =
    updateFormConfig[nodeLabel] || updateFormConfig.default;

  const handleUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdateFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (fieldName: string) => {
    setUpdateFormValues((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Llamada a la API para actualizar el nodo (según corresponda)
  };

  const handleNodeTypeSelect = async (nodeType: string) => {
    setSelectedConnectionType(nodeType);
    setSelectedConnectionId(null);
    setSelectedConnectionDisplay("");
    setPossibleConnections([]);
    if (!nodeType) return;
    try {
      const results = await categorizerAPI.fetchNodesByType(nodeType);
      setPossibleConnections(results);
    } catch (error) {
      console.error("Error al traer posibles conexiones:", error);
    }
  };

  const handleConnectSubmit = async () => {
    if (!selectedConnectionId || !selectedNode || !selectedRelationship) return;

    try {
      const relationshipData = {
        sourceId: selectedNode.id,
        targetId: selectedConnectionId,
        relationshipType: selectedRelationship.id,
        relationshipProperties: {
          comment: relationComment,
          confidence: relationConfidence,
          weight: 0, // Peso inicial en 0
          createdBy: "admin", // Aquí podrías obtener el usuario actual
        },
      };

      await categorizerAPI.createRelationship(relationshipData);

      // Recargar conexiones después de crear una nueva
      const connections = await categorizerAPI.fetchNodeConnections(
        selectedNode.id
      );
      setCurrentConnections(connections);

      // Limpiar selección
      setSelectedConnectionId(null);
      setSelectedConnectionDisplay("");
      setRelationComment("");
    } catch (error) {
      console.error("Error al conectar nodos:", error);
    }
  };

  const handleDeleteConnection = async (connectionNodeId: string) => {
    if (!selectedNode.id) return;
    // Llamada a la API para eliminar la conexión usando connectionNodeId
  };

  const formatField = (label: string, value: any) => {
    if (value == null) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    return (
      <div className="mb-2" key={label}>
        <span className="font-bold">{label}: </span>
        {Array.isArray(value) ? value.join(", ") : value}
      </div>
    );
  };
  console.log(
    "this is what i want to connect ",
    selectedConnectionDisplay,
    selectedConnectionId
  );
  const searchField = searchFieldMapping[selectedConnectionType] || "title";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white border-4 border-black p-6 rounded-md max-w-2xl w-full min-h-[50vh] max-h-[80vh] overflow-y-auto transform rotate-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles del Nodo</h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 border-2 border-black"
          >
            X
          </button>
        </div>

        <div className="mb-4">
          {formatField("ID", selectedNode.id)}
          {currentFormFields.map((field) => {
            const propertyValue = (selectedNode as any)[field.name];
            return formatField(field.label, propertyValue);
          })}
        </div>

        <div className="flex space-x-2 mb-4">
          <BrutalButton
            onClick={() => setActiveTab("update")}
            variant={activeTab === "update" ? "blue" : "gray"}
          >
            Actualizar
          </BrutalButton>
          <BrutalButton
            onClick={() => setActiveTab("connect")}
            variant={activeTab === "connect" ? "blue" : "gray"}
          >
            Conexiones
          </BrutalButton>
        </div>

        {activeTab === "update" && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {currentFormFields.map((field) => {
              const fieldValue = updateFormValues[field.name] || "";
              if (field.type === "checkbox") {
                return (
                  <div key={field.name}>
                    <CustomCheckbox
                      label={field.label}
                      defaultChecked={Boolean(fieldValue)}
                      onChange={() => handleCheckboxChange(field.name)}
                    />
                  </div>
                );
              }
              return (
                <div key={field.name}>
                  <label className="font-bold block mb-1">{field.label}:</label>
                  <BrutalInput
                    type={field.type === "textarea" ? "text" : field.type}
                    multiline={field.type === "textarea"}
                    name={field.name}
                    value={fieldValue}
                    onChange={handleUpdateChange}
                  />
                </div>
              );
            })}
            <BrutalButton type="submit" variant="blue" className="w-full">
              Guardar Cambios
            </BrutalButton>
          </form>
        )}

        {activeTab === "connect" && (
          <div className="space-y-4">
            {currentConnections.length > 0 && (
              <div>
                <label className="font-bold block mb-2">
                  Conexiones actuales:
                </label>
                <div className="space-y-2">
                  {currentConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-2 border-2 border-black rounded"
                    >
                      <span>
                        {connection.title ||
                          `Nodo sin título (ID: ${connection.id})`}
                      </span>
                      <BrutalButton
                        onClick={() => handleDeleteConnection(connection.id)}
                        variant="red"
                        className="ml-2"
                      >
                        Eliminar
                      </BrutalButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="font-bold block mb-1">
                Tipo de nodo a conectar:
              </label>
              <BrutalDropDown
                buttonLabel={
                  nodeTypes.find((t) => t.id === selectedConnectionType)
                    ?.name || "Ninguno"
                }
                options={nodeTypes.map((type) => ({
                  label: type.name,
                  value: type.id,
                }))}
                onSelect={(value: string) => handleNodeTypeSelect(value)}
              />
            </div>

            {selectedConnectionType && (
              <div>
                <label className="font-bold block mb-1">
                  Buscar y seleccionar nodo de tipo [{selectedConnectionType}]
                  por {searchField}:
                </label>
                <BrutalSearchSelect
                  options={possibleConnections.map((option) => ({
                    value: option.id,
                    label:
                      (option as any)[searchField] ||
                      `Sin ${searchField} (ID: ${option.id})`,
                  }))}
                  selectedValue={selectedConnectionDisplay}
                  onSelect={(selectedOption) => {
                    if (selectedOption) {
                      setSelectedConnectionId(selectedOption.value);
                      setSelectedConnectionDisplay(selectedOption.label);
                    }
                  }}
                  placeholder="Escribe para filtrar..."
                  label=""
                />

                {selectedConnectionId && (
                  <>
                    <div className="mt-3">
                      <label className="font-bold block mb-1">
                        Tipo de relación:
                      </label>
                      <BrutalDropDown
                        buttonLabel={
                          selectedRelationship?.name || "Seleccionar relación"
                        }
                        options={availableRelationships.map((rel) => ({
                          label: rel.name,
                          value: rel.id,
                        }))}
                        onSelect={(value: string) => {
                          const rel = availableRelationships.find(
                            (r) => r.id === value
                          );
                          setSelectedRelationship(rel || null);
                        }}
                      />
                      {selectedRelationship && (
                        <p className="text-sm mt-1 text-gray-600">
                          {selectedRelationship.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3">
                      <label className="font-bold block mb-1">
                        Comentario (opcional):
                      </label>
                      <BrutalInput
                        type="text"
                        multiline={true}
                        value={relationComment}
                        onChange={(e) => setRelationComment(e.target.value)}
                        placeholder="Añade un comentario que explique esta relación..."
                      />
                    </div>

                    <div className="mt-3">
                      <label className="font-bold block mb-1">
                        Nivel de confianza:
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={relationConfidence}
                          onChange={(e) =>
                            setRelationConfidence(parseFloat(e.target.value))
                          }
                          className="w-full mr-2"
                        />
                        <span>{(relationConfidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </>
                )}

                <BrutalButton
                  onClick={handleConnectSubmit}
                  variant="purple"
                  className="mt-3 w-full"
                  disabled={!selectedConnectionId || !selectedRelationship}
                >
                  Conectar con relación {selectedRelationship?.name || ""}
                </BrutalButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
