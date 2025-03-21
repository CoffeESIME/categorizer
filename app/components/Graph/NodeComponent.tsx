"use client";

import React, { useState, useEffect } from "react";
import { DocumentNode } from "@/app/visualizer/page";

// Custom components
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import { BrutalButton } from "../ButtonComponent/ButtonComponent";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import BrutalSearchSelect from "../BurtalSearchSelectComponent/BrutalSearchComponent";
import categorizerAPI from "@/app/utils/categorizerAPI";

// Tipado para la configuración de cada campo
export interface UpdateFieldConfig {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "checkbox" | "textarea";
}

// Configuración para formularios de actualización
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

// Mapeo de tipo de nodo a campo de búsqueda
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

// Incluimos la opción "Ninguno" para que el usuario tenga que elegir explícitamente
const nodeTypeOptions = [
  { value: "", label: "Ninguno" },
  { value: "author", label: "Author" },
  { value: "book", label: "Book" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "tag", label: "Tag" },
  { value: "quote", label: "Quote" },
  { value: "music", label: "Music" },
  { value: "country", label: "Country" },
  { value: "language", label: "Language" },
];

// Tipado de props para el NodeDetailsPanel
interface NodeDetailsPanelProps {
  selectedNode: DocumentNode | null;
  onClose: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  selectedNode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"update" | "connect">("update");

  // Estado para manejar nodos conectados y posibles conexiones
  const [currentConnections, setCurrentConnections] = useState<DocumentNode[]>(
    []
  );
  const [possibleConnections, setPossibleConnections] = useState<
    DocumentNode[]
  >([]);

  // Estado para el tipo de nodo a conectar
  const [selectedConnectionType, setSelectedConnectionType] =
    useState<string>("");
  // Estados para almacenar el id del nodo seleccionado y el valor que se muestra en el input de búsqueda
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [selectedConnectionDisplay, setSelectedConnectionDisplay] =
    useState<string>("");

  // Valores del formulario de actualización
  const [updateFormValues, setUpdateFormValues] = useState<Record<string, any>>(
    {}
  );

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
        // Se utiliza el campo id (uuid) del nodo
        id: selectedNode.id || "",
      });
      // Aquí se podrían cargar las conexiones existentes
    }
  }, [selectedNode]);

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
    if (!nodeType) return; // Si "Ninguno" es seleccionado, no hacemos la llamada.
    try {
      const results = await categorizerAPI.fetchNodesByType(nodeType);
      setPossibleConnections(results);
    } catch (error) {
      console.error("Error al traer posibles conexiones:", error);
    }
  };

  const handleConnectSubmit = async () => {
    if (!selectedConnectionId) return;
    console.log("Conectando nodo con id:", selectedConnectionId);
    // Llamada a la API para conectar el nodo usando selectedConnectionId
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
  // Determinar el campo de búsqueda según el tipo seleccionado.
  const searchField = searchFieldMapping[selectedConnectionType] || "title";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white border-4 border-black p-6 rounded-md max-w-2xl w-full max-h-[80vh] overflow-y-auto transform rotate-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles del Nodo</h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 border-2 border-black"
          >
            X
          </button>
        </div>

        {/* Sección de detalle de campos */}
        <div className="mb-4">
          {formatField("ID", selectedNode.id)}
          {currentFormFields.map((field) => {
            const propertyValue = (selectedNode as any)[field.name];
            return formatField(field.label, propertyValue);
          })}
        </div>

        {/* Pestañas Actualizar / Conectar */}
        <div className="flex mb-4">
          <button
            className={`flex-1 p-2 border-b-2 ${
              activeTab === "update"
                ? "border-black font-bold"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("update")}
          >
            Actualizar Nodo
          </button>
          <button
            className={`flex-1 p-2 border-b-2 ${
              activeTab === "connect"
                ? "border-black font-bold"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("connect")}
          >
            Conectar Nodo
          </button>
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

            {/* Selección del tipo de nodo a conectar */}
            <div>
              <label className="font-bold block mb-1">
                Tipo de nodo a conectar:
              </label>
              <BrutalDropDown
                buttonLabel={
                  nodeTypeOptions.find(
                    (o) => o.value === selectedConnectionType
                  )?.label || "Ninguno"
                }
                options={nodeTypeOptions}
                onSelect={(value: string) => handleNodeTypeSelect(value)}
              />
            </div>

            {/* Si se eligió un tipo, mostrar búsqueda */}
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
                  // Se muestra el valor representativo (display) y se actualiza el id real seleccionado
                  selectedValue={selectedConnectionDisplay}
                  onSelect={(selectedOption) => {
                    console.log("selected", selectedOption);
                    if (selectedOption) {
                      setSelectedConnectionId(selectedOption.value);
                      setSelectedConnectionDisplay(selectedOption.label);
                    }
                  }}
                  placeholder="Escribe para filtrar..."
                  label=""
                />
                <BrutalButton
                  onClick={handleConnectSubmit}
                  variant="purple"
                  className="mt-2 w-full"
                >
                  Conectar al nodo seleccionado
                </BrutalButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
