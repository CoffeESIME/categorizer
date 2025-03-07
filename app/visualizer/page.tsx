"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";

interface NodeDatum {
  id: string;
  group: number;
  info: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkDatum {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
  info: string;
}

interface GraphData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

// Datos de ejemplo
const mockData: GraphData = {
  nodes: [
    { id: "1", group: 1, info: "Nodo 1 (Grupo 1)" },
    { id: "2", group: 2, info: "Nodo 2 (Grupo 2)" },
    { id: "3", group: 1, info: "Nodo 3 (Grupo 1)" },
    { id: "4", group: 3, info: "Nodo 4 (Grupo 3)" },
    { id: "5", group: 2, info: "Nodo 5 (Grupo 2)" },
  ],
  links: [
    { source: "1", target: "2", value: 1, info: "Relación A" },
    { source: "2", target: "3", value: 2, info: "Relación B" },
    { source: "3", target: "4", value: 1, info: "Relación C" },
    { source: "2", target: "5", value: 3, info: "Relación D" },
  ],
};

export default function GraphVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Escala de colores
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Clonar datos para evitar mutaciones
    const links: LinkDatum[] = mockData.links.map((d) => ({ ...d }));
    const nodes: NodeDatum[] = mockData.nodes.map((d) => ({ ...d }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; background: #fff");

    // Crear la simulación de fuerza
    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, LinkDatum>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Dibujar enlaces con estilo "neo-brutalista": gruesos y negros
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#000")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "4,2");

    // Texto para cada enlace
    const linkText = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#000")
      .style("font-weight", "bold")
      .text((d) => d.info);

    // Dibujar nodos (círculos) con borde grueso
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 12)
      .attr("fill", (d) => color(d.group.toString()))
      .attr("stroke", "#000")
      .attr("stroke-width", 3);

    // Texto para cada nodo
    const nodeText = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dy", -18)
      .attr("font-size", 12)
      .attr("fill", "#000")
      .style("font-weight", "bold")
      .text((d) => d.info || d.id);

    // Arrastre de nodos
    (
      node as d3.Selection<SVGCircleElement, NodeDatum, SVGGElement, unknown>
    ).call(
      d3
        .drag<SVGCircleElement, NodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    function ticked() {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      linkText
        .attr(
          "x",
          (d) => ((d.source as NodeDatum).x! + (d.target as NodeDatum).x!) / 2
        )
        .attr(
          "y",
          (d) => ((d.source as NodeDatum).y! + (d.target as NodeDatum).y!) / 2
        );

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      nodeText.attr("x", (d) => d.x!).attr("y", (d) => d.y! - 18);
    }

    return () => {
      simulation.stop();
    };
  }, []);

  // Ejemplo de funciones de menú (puedes adaptarlas según tu lógica real)
  const handleReloadGraph = () => {
    // Ej: recargar o volver a ejecutar la simulación
    window.location.reload();
  };

  const handleAddNode = () => {
    // Lógica para añadir un nodo en la DB
    alert("Funcionalidad 'Agregar Nodo' no implementada todavía.");
  };

  const handleFilter = () => {
    // Lógica para filtrar nodos/relaciones
    alert("Funcionalidad 'Filtrar' no implementada todavía.");
  };

  return (
    <div className="flex min-h-screen border-4 border-black bg-white">
      <div className="w-64 border-r-4 border-black p-4 bg-[#FFD6E8] -rotate-1 origin-top-left transform flex flex-col gap-4">
        <TitleComponent title="Graph Menu" variant="yellow" />
        <BrutalButton variant="blue" onClick={handleAddNode}>
          Agregar Nodo
        </BrutalButton>
        <BrutalButton variant="green" onClick={handleFilter}>
          Filtrar
        </BrutalButton>
        <BrutalButton variant="red" onClick={handleReloadGraph}>
          Recargar
        </BrutalButton>{" "}
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>
      <div className="flex-1 p-4 bg-[#FFFCD6] rotate-1 origin-top-left transform">
        <div className="border-4 border-black p-2 rounded-md bg-[#FFFFFF]">
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
}
