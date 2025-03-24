"use client";

import React, { useEffect, useState } from "react";
import { DocumentNode, NodeType } from "@/app/types/nodeTypes";
import categorizerAPI from "@/app/utils/categorizerAPI";
import { BrutalButton } from "@/app/components/ButtonComponent/ButtonComponent";
import { TitleComponent } from "@/app/components/TitleComponent/TtitleComponent";
import BrutalDropDown from "@/app/components/DropDownComponent/DropdownComponent";
import { BrutalInput } from "@/app/components/InputComponent/InputComponent";
import Link from "next/link";
import { NodeDetailsPanel } from "@/app/components/Graph/NodeComponent";
import { NodeRelationsView } from "@/app/components/Graph/NodeRelationsView";

export default function NodesByTypeView() {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<DocumentNode | null>(null);
  const [nodes, setNodes] = useState<DocumentNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewingRelations, setViewingRelations] = useState<boolean>(false);
  const [selectedNodeForRelations, setSelectedNodeForRelations] = useState<
    string | null
  >(null);

  // Cargar tipos de nodos al montar el componente
  useEffect(() => {
    async function fetchNodeTypes() {
      try {
        const types = await categorizerAPI.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error("Error al cargar tipos de nodos:", error);
      }
    }

    fetchNodeTypes();
  }, []);

  // Cargar nodos cuando se selecciona un tipo
  useEffect(() => {
    if (!selectedType) {
      setNodes([]);
      return;
    }

    async function fetchNodesByType() {
      try {
        setLoading(true);
        const fetchedNodes = await categorizerAPI.fetchNodesByType(
          selectedType
        );
        setNodes(fetchedNodes);
      } catch (error) {
        console.error("Error al cargar nodos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNodesByType();
  }, [selectedType]);

  const handleNodeSelect = (node: DocumentNode) => {
    setSelectedNode(node);
  };

  const handleCloseNodeDetails = () => {
    setSelectedNode(null);
  };

  const handleViewRelations = (nodeId: string) => {
    setSelectedNodeForRelations(nodeId);
    setViewingRelations(true);
  };

  const handleCloseRelationsView = () => {
    setViewingRelations(false);
    setSelectedNodeForRelations(null);
  };

  // Filtrar nodos según el término de búsqueda
  const filteredNodes = searchTerm
    ? nodes.filter((node) => {
        // Buscar en todos los campos de texto del nodo
        return Object.entries(node).some(([key, value]) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
      })
    : nodes;

  // Obtener el nombre para mostrar de un nodo según su tipo
  const getNodeDisplayName = (node: DocumentNode): string => {
    const nodeType = selectedType.toLowerCase();

    // Lógica para determinar qué campo usar como nombre según el tipo
    if (nodeType === "author" && "name" in node) {
      return (node as any).name || `Sin nombre (ID: ${node.id})`;
    }

    if (node.title) {
      return node.title;
    }

    if ("name" in node) {
      return (node as any).name;
    }

    return `Nodo ID: ${node.id}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <TitleComponent title="Nodos por tipo" />
        <div className="space-x-2">
          <Link href="/" className="inline-block">
            <BrutalButton variant="gray">Volver al Inicio</BrutalButton>
          </Link>
          <Link href="/node-management/node-types" className="inline-block">
            <BrutalButton variant="blue">Gestionar Tipos</BrutalButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Selección de tipo y búsqueda */}
        <div className="lg:col-span-1 border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Filtrar nodos</h2>

          <div className="mb-4">
            <label className="font-bold block mb-1">Tipo de nodo:</label>
            <BrutalDropDown
              buttonLabel={
                nodeTypes.find((t) => t.id === selectedType)?.name ||
                "Seleccionar tipo"
              }
              options={nodeTypes.map((type) => ({
                label: type.name,
                value: type.id,
              }))}
              onSelect={(value: string) => setSelectedType(value)}
            />
          </div>

          {selectedType && (
            <div className="mb-4">
              <label className="font-bold block mb-1">Buscar:</label>
              <BrutalInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para filtrar..."
              />
            </div>
          )}

          <div className="mt-6">
            <Link href="/visualizer" className="inline-block w-full">
              <BrutalButton variant="purple" className="w-full">
                Ver gráfico de conexiones
              </BrutalButton>
            </Link>
          </div>
        </div>

        {/* Panel derecho: Lista de nodos */}
        <div className="lg:col-span-2 border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">
            {selectedType
              ? `Nodos de tipo "${
                  nodeTypes.find((t) => t.id === selectedType)?.name ||
                  selectedType
                }"`
              : "Selecciona un tipo para ver sus nodos"}
          </h2>

          {loading ? (
            <p>Cargando nodos...</p>
          ) : selectedType ? (
            <>
              <div className="mb-2 text-sm">
                {filteredNodes.length} nodo(s) encontrado(s)
              </div>

              {filteredNodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredNodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 border-2 border-black rounded cursor-pointer hover:bg-blue-50"
                    >
                      <h3 className="font-bold text-lg truncate">
                        {getNodeDisplayName(node)}
                      </h3>
                      <p className="text-xs">ID: {node.id}</p>
                      {node.labels && node.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.labels.map((label, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-200 text-xs rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex mt-3 space-x-2">
                        <BrutalButton
                          variant="blue"
                          className="text-xs px-2 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                          }}
                        >
                          Ver detalles
                        </BrutalButton>
                        <BrutalButton
                          variant="purple"
                          className="text-xs px-2 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRelations(node.id);
                          }}
                        >
                          Ver relaciones
                        </BrutalButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No se encontraron nodos para este tipo o filtro</p>
              )}
            </>
          ) : (
            <p>Selecciona un tipo para ver sus nodos</p>
          )}
        </div>
      </div>

      {/* Panel de detalles del nodo seleccionado */}
      {selectedNode && (
        <NodeDetailsPanel
          selectedNode={selectedNode}
          onClose={handleCloseNodeDetails}
        />
      )}

      {/* Vista de relaciones del nodo */}
      {viewingRelations && selectedNodeForRelations && (
        <NodeRelationsView
          nodeId={selectedNodeForRelations}
          onClose={handleCloseRelationsView}
        />
      )}
    </div>
  );
}
