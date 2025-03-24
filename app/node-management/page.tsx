"use client";

import React from "react";
import { TitleComponent } from "@/app/components/TitleComponent/TtitleComponent";
import Link from "next/link";
import { BrutalButton } from "../components/ButtonComponent/ButtonComponent";

export default function NodeManagementIndex() {
  const menuOptions = [
    {
      title: "Tipos de nodos",
      description:
        "Gestionar los diferentes tipos de nodos que puede tener el sistema",
      href: "/node-management/node-types",
      color: "bg-blue-100",
    },
    {
      title: "Crear un nuevo nodo",
      description: "Añadir un nuevo nodo al sistema",
      href: "/node-management/create-node",
      color: "bg-green-100",
    },
    {
      title: "Ver nodos por tipo",
      description: "Explorar los nodos existentes filtrados por su tipo",
      href: "/node-management/nodes-by-type",
      color: "bg-purple-100",
    },
    {
      title: "Visualizador de grafos",
      description:
        "Ver las conexiones entre los nodos en una representación gráfica",
      href: "/visualizer",
      color: "bg-orange-100",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <TitleComponent title="Gestión de Nodos" />
        <Link href="/" className="inline-block">
          <BrutalButton variant="gray">Volver al Inicio</BrutalButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuOptions.map((option, index) => (
          <Link href={option.href} key={index} className="block">
            <div
              className={`border-4 border-black p-6 rounded-lg ${option.color} hover:shadow-lg transition-shadow transform hover:rotate-1`}
            >
              <h2 className="text-xl font-bold mb-2">{option.title}</h2>
              <p className="mb-4">{option.description}</p>
              <BrutalButton variant="blue" className="w-full">
                Ir a {option.title}
              </BrutalButton>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 border-4 border-black rounded-lg bg-yellow-100">
        <h2 className="text-xl font-bold mb-4">Información sobre los nodos</h2>
        <p className="mb-4">
          Los nodos son la estructura fundamental de este sistema de
          categorización. Cada nodo representa una entidad de información
          (documento, autor, concepto, etc.) y puede conectarse con otros nodos
          para formar una red de conocimiento.
        </p>
        <h3 className="font-bold mb-2">Características principales:</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>
            Los nodos tienen un tipo que define sus campos y características
          </li>
          <li>Pueden conectarse entre sí formando grafos de relaciones</li>
          <li>Se pueden clasificar y organizar según diferentes criterios</li>
          <li>Permiten visualizar conexiones entre diferentes elementos</li>
        </ul>
        <p>
          Utiliza las herramientas de esta sección para gestionar la estructura
          y el contenido de tu base de conocimiento.
        </p>
      </div>
    </div>
  );
}
