"use client";

import React, { useState, useEffect } from "react";
import { BrutalInput } from "@/app/components/InputComponent/InputComponent";
import { BrutalButton } from "@/app/components/ButtonComponent/ButtonComponent";
import BrutalDropDown from "@/app/components/DropDownComponent/DropdownComponent";
import CustomCheckbox from "@/app/components/CheckBoxComponent/CheckBoxComponent";
import categorizerAPI from "@/app/utils/categorizerAPI"; // Assuming this API utility can be extended or used
import { TitleComponent } from "@/app/components/TitleComponent/TtitleComponent";
import Link from "next/link";

// --- TypeScript Interfaces based on the JSON structure ---
interface StartNode {
  id?: string;
  label?: string;
  properties?: Record<string, any>;
}

interface PropertyFilter {
  key: string;
  operator: string;
  value: any;
  type: "string" | "integer" | "boolean" | "float";
}

const OPERATOR_OPTIONS = [
  { label: "=", value: "=" },
  { label: "!=", value: "!=" },
  { label: ">", value: ">" },
  { label: "<", value: "<" },
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
  { label: "CONTAINS", value: "CONTAINS" },
  { label: "STARTS WITH", value: "STARTS WITH" },
  { label: "ENDS WITH", value: "ENDS WITH" },
  { label: "IN", value: "IN" }, // For array checks
];

const PROPERTY_TYPE_OPTIONS = [
  { label: "Texto (string)", value: "string" },
  { label: "Entero (integer)", value: "integer" },
  { label: "Decimal (float)", value: "float" },
  { label: "Booleano (boolean)", value: "boolean" },
];

const RELATIONSHIP_DIRECTION_OPTIONS = [
  { label: "Ambas", value: "BOTH" },
  { label: "Saliente", value: "OUTGOING" },
  { label: "Entrante", value: "INCOMING" },
];

const PATH_ALGORITHM_OPTIONS = [
  { label: "BFS (Anchura)", value: "BFS" },
  { label: "DFS (Profundidad)", value: "DFS" },
];

const RETURN_NODES_OPTIONS = [
  { label: "Todos los recorridos", value: "all_traversed" },
  { label: "Inicio y Fin", value: "start_and_end" },
  { label: "IDs Explícitos", value: "explicit_ids" },
];

interface AdvancedSearchPayload {
  start_nodes?: StartNode[];
  match_criteria?: {
    node_labels?: string[];
    node_properties_filter?: PropertyFilter[];
    relationship_types?: string[];
    relationship_direction?: "BOTH" | "OUTGOING" | "INCOMING";
    relationship_properties_filter?: PropertyFilter[];
  };
  traversal_options?: {
    min_depth?: number;
    max_depth?: number;
    path_algorithm?: "BFS" | "DFS";
  };
  result_options?: {
    return_nodes?: "all_traversed" | "start_and_end" | "explicit_ids";
    return_edges?: boolean;
    node_properties_to_return?: string[];
    edge_properties_to_return?: string[];
    limit_nodes?: number;
    limit_edges?: number;
  };
  custom_cypher_conditions?: {
    node_match_append?: string;
    relationship_match_append?: string;
  };
}

const initialPayload: AdvancedSearchPayload = {
  start_nodes: [],
  match_criteria: {
    node_labels: [],
    node_properties_filter: [],
    relationship_types: [],
    relationship_direction: "BOTH",
    relationship_properties_filter: [],
  },
  traversal_options: {
    min_depth: 0,
    max_depth: 3,
    path_algorithm: "BFS",
  },
  result_options: {
    return_nodes: "all_traversed",
    return_edges: true,
    node_properties_to_return: [],
    edge_properties_to_return: [],
    limit_nodes: 100,
    limit_edges: 200,
  },
  custom_cypher_conditions: {},
};

export default function AdvancedGraphSearchPage() {
  const [payload, setPayload] = useState<AdvancedSearchPayload>(initialPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers for Start Nodes ---
  const handleAddStartNode = () => {
    setPayload((prev) => ({
      ...prev,
      start_nodes: [
        ...(prev.start_nodes || []),
        { id: "", label: "", properties: {} },
      ],
    }));
  };

  const handleStartNodeChange = (
    index: number,
    field: keyof StartNode,
    value: any
  ) => {
    setPayload((prev) => {
      const newStartNodes = [...(prev.start_nodes || [])];
      newStartNodes[index] = { ...newStartNodes[index], [field]: value };
      return { ...prev, start_nodes: newStartNodes };
    });
  };

  const handleStartNodePropertyChange = (
    nodeIndex: number,
    key: string,
    value: any
  ) => {
    setPayload((prev) => {
      const newStartNodes = [...(prev.start_nodes || [])];
      if (newStartNodes[nodeIndex]) {
        newStartNodes[nodeIndex] = {
          ...newStartNodes[nodeIndex],
          properties: {
            ...(newStartNodes[nodeIndex].properties || {}),
            [key]: value,
          },
        };
      }
      return { ...prev, start_nodes: newStartNodes };
    });
  };

  const handleRemoveStartNode = (index: number) => {
    setPayload((prev) => ({
      ...prev,
      start_nodes: (prev.start_nodes || []).filter((_, i) => i !== index),
    }));
  };

  // --- Handlers for Property Filters (reusable for nodes and relationships) ---
  const handleAddPropertyFilter = (target: "node" | "relationship") => {
    const newFilter: PropertyFilter = {
      key: "",
      operator: "=",
      value: "",
      type: "string",
    };
    setPayload((prev) => {
      const criteria = prev.match_criteria || {};
      if (target === "node") {
        return {
          ...prev,
          match_criteria: {
            ...criteria,
            node_properties_filter: [
              ...(criteria.node_properties_filter || []),
              newFilter,
            ],
          },
        };
      } else {
        return {
          ...prev,
          match_criteria: {
            ...criteria,
            relationship_properties_filter: [
              ...(criteria.relationship_properties_filter || []),
              newFilter,
            ],
          },
        };
      }
    });
  };

  const handlePropertyFilterChange = (
    target: "node" | "relationship",
    index: number,
    field: keyof PropertyFilter,
    value: any
  ) => {
    setPayload((prev) => {
      const criteria = { ...(prev.match_criteria || {}) };
      const filters =
        target === "node"
          ? [...(criteria.node_properties_filter || [])]
          : [...(criteria.relationship_properties_filter || [])];

      if (filters[index]) {
        filters[index] = { ...filters[index], [field]: value };
        if (field === "type") {
          // Reset value if type changes to avoid type mismatches
          if (value === "boolean") filters[index].value = false;
          else if (value === "integer" || value === "float")
            filters[index].value = 0;
          else filters[index].value = "";
        }
        if (field === "value" && filters[index].type === "boolean") {
          filters[index].value = value === "true" || value === true;
        }
      }

      if (target === "node") {
        criteria.node_properties_filter = filters;
      } else {
        criteria.relationship_properties_filter = filters;
      }
      return { ...prev, match_criteria: criteria };
    });
  };

  const handleRemovePropertyFilter = (
    target: "node" | "relationship",
    index: number
  ) => {
    setPayload((prev) => {
      const criteria = { ...(prev.match_criteria || {}) };
      if (target === "node") {
        criteria.node_properties_filter = (
          criteria.node_properties_filter || []
        ).filter((_, i) => i !== index);
      } else {
        criteria.relationship_properties_filter = (
          criteria.relationship_properties_filter || []
        ).filter((_, i) => i !== index);
      }
      return { ...prev, match_criteria: criteria };
    });
  };

  // --- Generic Handlers for simple fields / dropdowns ---
  const handleMatchCriteriaChange = (
    field: keyof NonNullable<AdvancedSearchPayload["match_criteria"]>,
    value: any
  ) => {
    setPayload((prev) => ({
      ...prev,
      match_criteria: {
        ...(prev.match_criteria || {}),
        [field]: value,
      },
    }));
  };

  const handleTraversalOptionsChange = (
    field: keyof NonNullable<AdvancedSearchPayload["traversal_options"]>,
    value: any
  ) => {
    setPayload((prev) => ({
      ...prev,
      traversal_options: {
        ...(prev.traversal_options || {}),
        [field]:
          field === "min_depth" || field === "max_depth"
            ? parseInt(value, 10)
            : value,
      },
    }));
  };

  const handleResultOptionsChange = (
    field: keyof NonNullable<AdvancedSearchPayload["result_options"]>,
    value: any
  ) => {
    setPayload((prev) => ({
      ...prev,
      result_options: {
        ...(prev.result_options || {}),
        [field]:
          field === "limit_nodes" || field === "limit_edges"
            ? parseInt(value, 10)
            : field === "return_edges"
            ? value === "true" || value === true
            : value,
      },
    }));
  };

  const handleCustomCypherChange = (
    field: keyof NonNullable<AdvancedSearchPayload["custom_cypher_conditions"]>,
    value: any
  ) => {
    setPayload((prev) => ({
      ...prev,
      custom_cypher_conditions: {
        ...(prev.custom_cypher_conditions || {}),
        [field]: value,
      },
    }));
  };

  // --- Form Submission ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSearchResult(null);
    setError(null);

    // Clean up empty arrays/objects before sending if necessary
    const cleanedPayload = JSON.parse(JSON.stringify(payload)); // Deep clone
    if (cleanedPayload.start_nodes?.length === 0)
      delete cleanedPayload.start_nodes;

    try {
      // Replace with your actual API call structure
      // const response = await categorizerAPI.advancedGraphSearch(cleanedPayload);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CATEGORIZER_URL}/api/graph/search/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
      const data = await response.json();
      setSearchResult(data);
    } catch (err: any) {
      setError(err.message || "Error al realizar la búsqueda avanzada.");
      console.error("Advanced search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPropertyFilter = (
    filter: PropertyFilter,
    index: number,
    target: "node" | "relationship"
  ) => (
    <div
      key={index}
      className="p-3 border-2 border-dashed border-gray-400 rounded-md space-y-2 mb-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <BrutalInput
          label="Clave (Key):"
          value={filter.key}
          onChange={(e) =>
            handlePropertyFilterChange(target, index, "key", e.target.value)
          }
          placeholder="Ej: name, birth_year"
        />
        <BrutalDropDown
          buttonLabel={`Tipo: ${
            PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === filter.type)
              ?.label || "Seleccionar"
          }`}
          options={PROPERTY_TYPE_OPTIONS}
          onSelect={(value) =>
            handlePropertyFilterChange(target, index, "type", value)
          }
        />
      </div>
      <BrutalDropDown
        buttonLabel={`Operador: ${
          OPERATOR_OPTIONS.find((opt) => opt.value === filter.operator)
            ?.label || "Seleccionar"
        }`}
        options={OPERATOR_OPTIONS}
        onSelect={(value) =>
          handlePropertyFilterChange(target, index, "operator", value)
        }
      />
      {filter.type === "boolean" ? (
        <BrutalDropDown
          buttonLabel={`Valor: ${
            filter.value === true
              ? "Verdadero"
              : filter.value === false
              ? "Falso"
              : "Seleccionar"
          }`}
          options={[
            { label: "Verdadero", value: "true" },
            { label: "Falso", value: "false" },
          ]}
          onSelect={(value) =>
            handlePropertyFilterChange(target, index, "value", value === "true")
          }
        />
      ) : (
        <BrutalInput
          label="Valor:"
          type={
            filter.type === "integer" || filter.type === "float"
              ? "number"
              : "text"
          }
          value={filter.value}
          onChange={(e) =>
            handlePropertyFilterChange(
              target,
              index,
              "value",
              filter.type === "integer" || filter.type === "float"
                ? parseFloat(e.target.value)
                : e.target.value
            )
          }
          placeholder="Valor del filtro"
        />
      )}
      <BrutalButton
        onClick={() => handleRemovePropertyFilter(target, index)}
        variant="red"
        className="text-xs"
      >
        Eliminar Filtro de Propiedad
      </BrutalButton>
    </div>
  );

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <TitleComponent
          title="Búsqueda Avanzada en Grafo"
          variant="neobrutalism"
        />
        <Link href="/visualizer">
          <BrutalButton variant="gray">Volver al Visualizador</BrutalButton>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-6 border-4 border-black rounded-lg bg-white shadow-lg"
      >
        {/* Secciones del formulario aquí */}
        {/* Sección Nodos de Inicio */}
        <section className="p-4 border-2 border-black rounded-md bg-yellow-50">
          <h3 className="text-xl font-semibold mb-3">
            Nodos de Inicio (Opcional)
          </h3>
          {payload.start_nodes?.map((node, index) => (
            <div
              key={index}
              className="p-3 border border-gray-300 rounded-md mb-3 space-y-2 bg-white"
            >
              <BrutalInput
                label={`ID Nodo #${index + 1}:`}
                value={node.id || ""}
                onChange={(e) =>
                  handleStartNodeChange(index, "id", e.target.value)
                }
                placeholder="ID del nodo (opcional)"
              />
              <BrutalInput
                label={`Etiqueta Nodo #${index + 1}:`}
                value={node.label || ""}
                onChange={(e) =>
                  handleStartNodeChange(index, "label", e.target.value)
                }
                placeholder="Etiqueta (ej: Author, Book) (opcional)"
              />
              <div className="pl-4 border-l-2 border-gray-200">
                <h4 className="text-sm font-medium">
                  Propiedades del Nodo de Inicio (opcional):
                </h4>
                <BrutalInput
                  label="Clave Propiedad:"
                  onChange={(e) => {
                    // This assumes a simple key-value pair for now.
                    // For multiple properties, you'd need a more complex state management for node.properties
                    const key = e.target.value;
                    const currentVal = node.properties?.[key] || "";
                    handleStartNodePropertyChange(index, key, currentVal);
                  }}
                  placeholder="Ej: name"
                />
                <BrutalInput
                  label="Valor Propiedad:"
                  onChange={(e) => {
                    // This assumes only one property is being edited, identified by the first key in node.properties
                    const firstKey = Object.keys(node.properties || {})[0];
                    if (firstKey) {
                      handleStartNodePropertyChange(
                        index,
                        firstKey,
                        e.target.value
                      );
                    }
                  }}
                  placeholder="Ej: Specific Name"
                />
              </div>
              <BrutalButton
                onClick={() => handleRemoveStartNode(index)}
                variant="red"
                className="text-xs"
              >
                Eliminar Nodo de Inicio
              </BrutalButton>
            </div>
          ))}
          <BrutalButton
            type="button"
            onClick={handleAddStartNode}
            variant="teal"
          >
            + Añadir Nodo de Inicio
          </BrutalButton>
        </section>

        {/* Sección Criterios de Coincidencia */}
        <section className="p-4 border-2 border-black rounded-md bg-blue-50">
          <h3 className="text-xl font-semibold mb-3">
            Criterios de Coincidencia
          </h3>
          <BrutalInput
            label="Etiquetas de Nodo (separadas por coma):"
            value={payload.match_criteria?.node_labels?.join(", ") || ""}
            onChange={(e) =>
              handleMatchCriteriaChange(
                "node_labels",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ej: Author, Book, Quote"
          />

          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">
              Filtros de Propiedades de Nodo:
            </h4>
            {payload.match_criteria?.node_properties_filter?.map(
              (filter, index) => renderPropertyFilter(filter, index, "node")
            )}
            <BrutalButton
              type="button"
              onClick={() => handleAddPropertyFilter("node")}
              variant="teal"
              className="text-sm"
            >
              + Añadir Filtro de Propiedad de Nodo
            </BrutalButton>
          </div>

          <BrutalInput
            label="Tipos de Relación (separadas por coma):"
            className="mt-4"
            value={payload.match_criteria?.relationship_types?.join(", ") || ""}
            onChange={(e) =>
              handleMatchCriteriaChange(
                "relationship_types",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ej: WROTE, HAS_QUOTE"
          />
          <div className="mt-2">
            <label className="font-bold block mb-1">
              Dirección de Relación:
            </label>
            <BrutalDropDown
              buttonLabel={
                RELATIONSHIP_DIRECTION_OPTIONS.find(
                  (opt) =>
                    opt.value === payload.match_criteria?.relationship_direction
                )?.label || "Seleccionar"
              }
              options={RELATIONSHIP_DIRECTION_OPTIONS}
              onSelect={(value) =>
                handleMatchCriteriaChange("relationship_direction", value)
              }
            />
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">
              Filtros de Propiedades de Relación:
            </h4>
            {payload.match_criteria?.relationship_properties_filter?.map(
              (filter, index) =>
                renderPropertyFilter(filter, index, "relationship")
            )}
            <BrutalButton
              type="button"
              onClick={() => handleAddPropertyFilter("relationship")}
              variant="teal"
              className="text-sm"
            >
              + Añadir Filtro de Propiedad de Relación
            </BrutalButton>
          </div>
        </section>

        {/* Sección Opciones de Recorrido */}
        <section className="p-4 border-2 border-black rounded-md bg-green-50">
          <h3 className="text-xl font-semibold mb-3">Opciones de Recorrido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BrutalInput
              label="Profundidad Mínima:"
              type="number"
              min="0"
              value={payload.traversal_options?.min_depth || 0}
              onChange={(e) =>
                handleTraversalOptionsChange("min_depth", e.target.value)
              }
            />
            <BrutalInput
              label="Profundidad Máxima:"
              type="number"
              min="0"
              value={payload.traversal_options?.max_depth || 3}
              onChange={(e) =>
                handleTraversalOptionsChange("max_depth", e.target.value)
              }
            />
          </div>
          <div className="mt-2">
            <label className="font-bold block mb-1">
              Algoritmo de Recorrido:
            </label>
            <BrutalDropDown
              buttonLabel={
                PATH_ALGORITHM_OPTIONS.find(
                  (opt) =>
                    opt.value === payload.traversal_options?.path_algorithm
                )?.label || "Seleccionar"
              }
              options={PATH_ALGORITHM_OPTIONS}
              onSelect={(value) =>
                handleTraversalOptionsChange("path_algorithm", value)
              }
            />
          </div>
        </section>

        {/* Sección Opciones de Resultado */}
        <section className="p-4 border-2 border-black rounded-md bg-purple-50">
          <h3 className="text-xl font-semibold mb-3">Opciones de Resultado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Retornar Nodos:</label>
              <BrutalDropDown
                buttonLabel={
                  RETURN_NODES_OPTIONS.find(
                    (opt) => opt.value === payload.result_options?.return_nodes
                  )?.label || "Seleccionar"
                }
                options={RETURN_NODES_OPTIONS}
                onSelect={(value) =>
                  handleResultOptionsChange("return_nodes", value)
                }
              />
            </div>
            <div>
              <label className="font-bold block mb-1">
                Retornar Aristas (Edges):
              </label>
              <CustomCheckbox
                label={payload.result_options?.return_edges ? "Sí" : "No"}
                checked={payload.result_options?.return_edges || false}
                onChange={(e) =>
                  handleResultOptionsChange("return_edges", e.target.checked)
                }
              />
            </div>
          </div>
          <BrutalInput
            label="Propiedades de Nodo a Retornar (separadas por coma):"
            className="mt-2"
            value={
              payload.result_options?.node_properties_to_return?.join(", ") ||
              ""
            }
            onChange={(e) =>
              handleResultOptionsChange(
                "node_properties_to_return",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ej: name, title, doc_id (vacío para todas)"
          />
          <BrutalInput
            label="Propiedades de Arista a Retornar (separadas por coma):"
            className="mt-2"
            value={
              payload.result_options?.edge_properties_to_return?.join(", ") ||
              ""
            }
            onChange={(e) =>
              handleResultOptionsChange(
                "edge_properties_to_return",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ej: year, source (vacío para todas)"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <BrutalInput
              label="Límite de Nodos:"
              type="number"
              min="0"
              value={payload.result_options?.limit_nodes || 100}
              onChange={(e) =>
                handleResultOptionsChange("limit_nodes", e.target.value)
              }
            />
            <BrutalInput
              label="Límite de Aristas:"
              type="number"
              min="0"
              value={payload.result_options?.limit_edges || 200}
              onChange={(e) =>
                handleResultOptionsChange("limit_edges", e.target.value)
              }
            />
          </div>
        </section>

        {/* Sección Condiciones Cypher Personalizadas */}
        <section className="p-4 border-2 border-black rounded-md bg-pink-50">
          <h3 className="text-xl font-semibold mb-3">
            Condiciones Cypher Personalizadas (Avanzado)
          </h3>
          <BrutalInput
            label="Añadir a MATCH de Nodos (ej: AND n.views > 100):"
            value={payload.custom_cypher_conditions?.node_match_append || ""}
            onChange={(e) =>
              handleCustomCypherChange("node_match_append", e.target.value)
            }
            placeholder="Condición Cypher adicional para nodos"
          />
          <BrutalInput
            label="Añadir a MATCH de Relaciones (ej: AND r.weight >= 0.5):"
            className="mt-2"
            value={
              payload.custom_cypher_conditions?.relationship_match_append || ""
            }
            onChange={(e) =>
              handleCustomCypherChange(
                "relationship_match_append",
                e.target.value
              )
            }
            placeholder="Condición Cypher adicional para relaciones"
          />
        </section>

        <BrutalButton
          type="submit"
          variant="green"
          disabled={isLoading}
          className="w-full py-3 text-lg"
        >
          {isLoading ? "Buscando..." : "Realizar Búsqueda Avanzada"}
        </BrutalButton>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 rounded-md text-red-700">
          <h4 className="font-bold">Error:</h4>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {searchResult && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-md">
          <h4 className="text-xl font-bold mb-2">Resultado de la Búsqueda:</h4>
          <pre className="text-sm bg-gray-800 text-white p-4 rounded overflow-x-auto">
            {JSON.stringify(searchResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
