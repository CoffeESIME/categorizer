import { useRef, useEffect } from "react";
import * as d3 from "d3";

// Interfaces para nodos y links
export interface HeterogeneousNode {
  // Se asume que cada nodo tiene un id único, ya sea en doc_id o id
  doc_id?: string;
  id?: string;
  // Otras propiedades que puedan tener (pueden ser heterogéneas)
  [key: string]: any;
}

export interface HeterogeneousEdge {
  source: string; // se espera el id del nodo origen
  target: string; // se espera el id del nodo destino
  relation: string;
  value?: number;
}

export interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  data: HeterogeneousNode;
  group: number;
  info: string;
}

export interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
  info: string;
}

export interface UseHeterogeneousGraphProps {
  nodes: HeterogeneousNode[];
  edges: HeterogeneousEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: HeterogeneousNode) => void;
}

export function useHeterogeneousGraph({
  nodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick,
}: UseHeterogeneousGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(
    null
  );

  // Convertir nodos heterogéneos a NodeDatum para D3
  const convertToGraphData = (
    nodes: HeterogeneousNode[],
    edges: HeterogeneousEdge[]
  ): { nodes: NodeDatum[]; links: LinkDatum[] } => {
    // Para cada nodo, usamos doc_id o id para definir el identificador
    const d3Nodes: NodeDatum[] = nodes.map((node) => {
      const id = node.doc_id || node.id || `unknown-${Math.random()}`;
      // Aquí puedes definir la lógica de grupo según alguna propiedad; por ejemplo,
      // si existe sentiment_word, asignar un grupo; de lo contrario, grupo 1.
      const group = node.sentiment_word
        ? node.sentiment_word === "neutro"
          ? 1
          : node.sentiment_word === "negativo"
          ? 2
          : 3
        : 1;
      return {
        id,
        data: node,
        group,
        info: id,
      };
    });

    // Para los links, simplemente mapeamos los datos recibidos, asignando un valor por defecto
    const d3Links: LinkDatum[] = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      value: edge.value || 1,
      info: edge.relation,
    }));

    return { nodes: d3Nodes, links: d3Links };
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Detener simulaciones anteriores
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const graphData = convertToGraphData(nodes, edges);

    // Definir escala de colores (ajusta el dominio según tu lógica)
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(["1", "2", "3", "4"])
      .range(["#5DADE2", "#E74C3C", "#58D68D", "#F4D03F"]);

    // Seleccionar y limpiar el SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; background: #fff");

    // Crear la simulación de fuerza
    const simulation = d3
      .forceSimulation<NodeDatum>(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, LinkDatum>(graphData.links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulationRef.current = simulation;

    // Dibujar links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    // Dibujar texto de links
    const linkText = svg
      .append("g")
      .selectAll("text")
      .data(graphData.links)
      .join("text")
      .text((d) => d.info)
      .attr("font-size", 10)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .attr("dy", -3);

    // Dibujar nodos
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", (d) => color(d.group.toString()))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
          event.stopPropagation();
        }
      });

    // Dibujar etiquetas de nodos
    const nodeLabel = svg
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text((d) => {
        const id = d.id || "";
        return id.length > 20 ? id.substring(0, 17) + "..." : id;
      })
      .attr("font-size", 10)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .attr("dy", -20);

    // Habilitar el drag de los nodos
    (
      node as unknown as d3.Selection<SVGCircleElement, NodeDatum, any, any>
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

    // Función de actualización en cada tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      linkText
        .attr(
          "x",
          (d) =>
            (((d.source as NodeDatum).x! as number) +
              ((d.target as NodeDatum).x! as number)) /
            2
        )
        .attr(
          "y",
          (d) =>
            (((d.source as NodeDatum).y! as number) +
              ((d.target as NodeDatum).y! as number)) /
            2
        );

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      nodeLabel.attr("x", (d) => d.x!).attr("y", (d) => d.y! - 20);
    });

    // Cleanup: detener la simulación al desmontar
    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height, onNodeClick]);

  return {
    svgRef,
    simulation: simulationRef.current,
    zoomIn: () => {
      // Implementa la lógica de zoom in si es necesario
    },
    zoomOut: () => {
      // Implementa la lógica de zoom out si es necesario
    },
    resetView: () => {
      // Implementa la lógica para resetear la vista
    },
  };
}
