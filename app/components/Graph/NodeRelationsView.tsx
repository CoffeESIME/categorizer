"use client";

import React, { useState, useEffect } from "react";
import { DocumentNode } from "@/app/types/nodeTypes";
import { RelationshipType } from "@/app/types/relationshipTypes";
import { BrutalButton } from "../ButtonComponent/ButtonComponent";
import categorizerAPI from "@/app/utils/categorizerAPI";

interface NodeRelation {
  sourceNode: DocumentNode;
  targetNode: DocumentNode;
  relationshipType: string;
  relationshipName: string;
  relationshipProperties: {
    comment?: string;
    confidence: number;
    weight: number;
    createdBy?: string;
    createdAt?: string;
  };
}

interface NodeRelationsViewProps {
  nodeId: string;
  onClose: () => void;
}

export const NodeRelationsView: React.FC<NodeRelationsViewProps> = ({
  nodeId,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<NodeRelation[]>([]);
  const [node, setNode] = useState<DocumentNode | null>(null);
  const [relationshipTypes, setRelationshipTypes] = useState<
    RelationshipType[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Obtener tipos de relaciones disponibles
        const types = await categorizerAPI.getRelationshipTypes();
        setRelationshipTypes(types);

        // Obtener relaciones del nodo
        const relationData = await categorizerAPI.getNodeRelationships(nodeId);
        setRelations(relationData);

        // Obtener detalles del nodo
        // Aquí necesitaríamos una API para obtener los detalles de un nodo específico
        // Por ahora, simulamos los datos
        const nodeDetails = relationData[0]?.sourceNode || null;
        setNode(nodeDetails);
      } catch (error) {
        console.error("Error al cargar datos de relaciones:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [nodeId]);

  const getRelationshipName = (relType: string): string => {
    const relationship = relationshipTypes.find((rt) => rt.id === relType);
    return relationship?.name || relType;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Desconocido";
    return new Date(dateString).toLocaleString();
  };

  const handleDeleteRelation = async (
    sourceId: string,
    targetId: string,
    relType: string
  ) => {
    try {
      await categorizerAPI.deleteNodeConnection(sourceId, targetId, relType);
      // Actualizar la lista de relaciones
      const updatedRelations = relations.filter(
        (rel) =>
          !(
            rel.sourceNode.id === sourceId &&
            rel.targetNode.id === targetId &&
            rel.relationshipType === relType
          )
      );
      setRelations(updatedRelations);
    } catch (error) {
      console.error("Error al eliminar relación:", error);
    }
  };

  const getNodeDisplayName = (node: DocumentNode): string => {
    if (node.title) return node.title;
    if ("name" in node) return (node as any).name;
    return `Nodo ID: ${node.id}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white border-4 border-black p-6 rounded-md max-w-3xl w-full max-h-[90vh] overflow-y-auto transform -rotate-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Relaciones del Nodo:{" "}
            {node ? getNodeDisplayName(node) : `ID: ${nodeId}`}
          </h2>
          <BrutalButton onClick={onClose} variant="red">
            Cerrar
          </BrutalButton>
        </div>

        {loading ? (
          <div className="p-4 text-center">Cargando relaciones...</div>
        ) : relations.length === 0 ? (
          <div className="p-4 border-2 border-gray-300 text-center">
            Este nodo no tiene relaciones con otros nodos.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-2 mb-4">
              <h3 className="font-bold text-lg">Relaciones salientes</h3>
              <p className="text-sm text-gray-600">
                Relaciones donde este nodo es el origen
              </p>
            </div>

            {relations
              .filter((rel) => rel.sourceNode.id === nodeId)
              .map((relation, index) => (
                <div
                  key={`out-${index}`}
                  className="border-2 border-black p-4 rounded-lg hover:bg-blue-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-bold">
                      {getRelationshipName(relation.relationshipType)}
                    </h3>
                    <BrutalButton
                      variant="red"
                      onClick={() =>
                        handleDeleteRelation(
                          relation.sourceNode.id,
                          relation.targetNode.id,
                          relation.relationshipType
                        )
                      }
                      className="text-sm"
                    >
                      Eliminar
                    </BrutalButton>
                  </div>

                  <div className="mt-2">
                    <span className="font-medium">Destino:</span>{" "}
                    {getNodeDisplayName(relation.targetNode)}
                  </div>

                  {relation.relationshipProperties.comment && (
                    <div className="mt-2">
                      <span className="font-medium">Comentario:</span>{" "}
                      {relation.relationshipProperties.comment}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <div>
                      <span className="font-medium">Confianza:</span>{" "}
                      {(
                        relation.relationshipProperties.confidence * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span>{" "}
                      {relation.relationshipProperties.weight}
                    </div>
                    <div>
                      <span className="font-medium">Creado por:</span>{" "}
                      {relation.relationshipProperties.createdBy ||
                        "Desconocido"}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{" "}
                      {formatDate(relation.relationshipProperties.createdAt)}
                    </div>
                  </div>
                </div>
              ))}

            <div className="border-b-2 border-black pb-2 mb-4 mt-8">
              <h3 className="font-bold text-lg">Relaciones entrantes</h3>
              <p className="text-sm text-gray-600">
                Relaciones donde este nodo es el destino
              </p>
            </div>

            {relations
              .filter((rel) => rel.targetNode.id === nodeId)
              .map((relation, index) => (
                <div
                  key={`in-${index}`}
                  className="border-2 border-black p-4 rounded-lg hover:bg-blue-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-bold">
                      {getRelationshipName(relation.relationshipType)}
                    </h3>
                    <BrutalButton
                      variant="red"
                      onClick={() =>
                        handleDeleteRelation(
                          relation.sourceNode.id,
                          relation.targetNode.id,
                          relation.relationshipType
                        )
                      }
                      className="text-sm"
                    >
                      Eliminar
                    </BrutalButton>
                  </div>

                  <div className="mt-2">
                    <span className="font-medium">Origen:</span>{" "}
                    {getNodeDisplayName(relation.sourceNode)}
                  </div>

                  {relation.relationshipProperties.comment && (
                    <div className="mt-2">
                      <span className="font-medium">Comentario:</span>{" "}
                      {relation.relationshipProperties.comment}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <div>
                      <span className="font-medium">Confianza:</span>{" "}
                      {(
                        relation.relationshipProperties.confidence * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span>{" "}
                      {relation.relationshipProperties.weight}
                    </div>
                    <div>
                      <span className="font-medium">Creado por:</span>{" "}
                      {relation.relationshipProperties.createdBy ||
                        "Desconocido"}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{" "}
                      {formatDate(relation.relationshipProperties.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
