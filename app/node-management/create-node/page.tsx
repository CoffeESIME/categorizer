"use client";

import React, { useState } from "react";
import { CreateNodeData } from "@/app/types/nodeTypes";
import { CreateNodeWithTypeForm } from "@/app/components/Graph/NodeForm";
import categorizerAPI from "@/app/utils/categorizerAPI";
import { TitleComponent } from "@/app/components/TitleComponent/TtitleComponent";
import { BrutalButton } from "@/app/components/ButtonComponent/ButtonComponent";
import Link from "next/link";

export default function NodeCreationView() {
  const [creationResult, setCreationResult] = useState<{
    success: boolean;
    message: string;
    nodeId?: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateNode = async (data: CreateNodeData) => {
    if (!data.type) {
      setCreationResult({
        success: false,
        message: "Debes seleccionar un tipo de nodo",
      });
      return;
    }

    // Validar que el tipo tenga al menos un campo obligatorio completado
    const requiredFields = data.type.fields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !data.properties[field.fieldName]
    );

    if (missingFields.length > 0) {
      setCreationResult({
        success: false,
        message: `Faltan campos obligatorios: ${missingFields
          .map((f) => f.fieldName)
          .join(", ")}`,
      });
      return;
    }

    try {
      setIsCreating(true);
      const result = await categorizerAPI.createNode(data);
      setCreationResult({
        success: true,
        message: "Nodo creado correctamente",
        nodeId: result.id,
      });
    } catch (error: any) {
      setCreationResult({
        success: false,
        message: `Error al crear el nodo: ${
          error.message || "Error desconocido"
        }`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <TitleComponent title="Crear nuevo nodo" />
        <div className="space-x-2">
          <Link href="/" className="inline-block">
            <BrutalButton variant="gray">Volver al Inicio</BrutalButton>
          </Link>
          <Link href="/node-management/nodes-by-type" className="inline-block">
            <BrutalButton variant="blue">Ver nodos existentes</BrutalButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: Formulario de creación */}
        <div className="border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Formulario de creación</h2>
          <CreateNodeWithTypeForm onCreateNode={handleCreateNode} />
        </div>

        {/* Panel derecho: Resultado y ayuda */}
        <div className="border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Información y Resultado</h2>

          {isCreating ? (
            <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded mb-4">
              <p className="font-bold">Creando nodo...</p>
            </div>
          ) : creationResult ? (
            <div
              className={`p-4 border-2 ${
                creationResult.success
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              } rounded mb-4`}
            >
              <p className="font-bold">
                {creationResult.success ? "Éxito" : "Error"}
              </p>
              <p>{creationResult.message}</p>

              {creationResult.success && creationResult.nodeId && (
                <div className="mt-2">
                  <p>ID del nuevo nodo: {creationResult.nodeId}</p>
                  <div className="mt-2">
                    <Link href="/visualizer" className="inline-block">
                      <BrutalButton variant="purple">
                        Ver en el Visualizador
                      </BrutalButton>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 border-2 border-gray-300 bg-gray-50 rounded mb-4">
              <p className="text-gray-600">
                Selecciona un tipo de nodo y completa los campos requeridos para
                crear un nuevo nodo.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-bold mb-2">¿Qué son los nodos?</h3>
            <p className="mb-4">
              Los nodos son las entidades principales que forman la base de
              conocimiento. Cada tipo de nodo representa una categoría diferente
              de información, como documentos, autores, países, etc.
            </p>

            <h3 className="font-bold mb-2">Consejos para crear nodos:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Elige el tipo adecuado según la información que quieras
                registrar.
              </li>
              <li>Completa todos los campos marcados como obligatorios.</li>
              <li>
                Utiliza términos precisos y consistentes para facilitar la
                búsqueda.
              </li>
              <li>
                Una vez creado, podrás conectarlo con otros nodos en el
                visualizador.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
