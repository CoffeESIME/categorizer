import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { DocumentNode } from "../types/nodeTypes";

// Types - moved to a separate file
export interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  data: DocumentNode;
  group: number;
  info: string;
}

export interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
  info: string;
}

interface UseDocumentGraphProps {
  documents: DocumentNode[];
  edges: {
    source: string;
    target: string;
    relation: string;
  }[];
  width?: number;
  height?: number;
  onNodeClick?: (node: DocumentNode) => void;
}

export function useDocumentGraph({
  documents,
  edges,
  width = 800,
  height = 600,
  onNodeClick,
}: UseDocumentGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(
    null
  );
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Convert documents to nodes and links for D3
  const convertToGraphData = (
    docs: DocumentNode[]
  ): { nodes: NodeDatum[]; links: LinkDatum[] } => {
    const nodes: NodeDatum[] = docs.map((doc) => ({
      id: doc.doc_id,
      data: doc,
      group: doc.sentiment_word
        ? doc.sentiment_word === "neutro"
          ? 1
          : doc.sentiment_word === "negativo"
          ? 2
          : 3
        : 4,
      info: doc.doc_id,
    }));

    // Simple link generation (adjust to your logic)
    const links: LinkDatum[] = [];
    const docIdGroups = docs.reduce((acc, doc) => {
      if (!acc[doc.doc_id]) acc[doc.doc_id] = [];
      acc[doc.doc_id].push(doc);
      return acc;
    }, {} as Record<string, DocumentNode[]>);

    Object.values(docIdGroups).forEach((group) => {
      if (group.length > 1) {
        for (let i = 0; i < group.length - 1; i++) {
          links.push({
            source: group[i].doc_id,
            target: group[i + 1].doc_id,
            value: 3,
            info: "Same Document",
          });
        }
      }
    });

    return { nodes, links };
  };

  // Render graph
  useEffect(() => {
    if (!svgRef.current || documents.length === 0) return;

    // Clean up previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const graphData = convertToGraphData(documents);

    // Color by group
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(["1", "2", "3", "4"])
      .range(["#5DADE2", "#E74C3C", "#58D68D", "#F4D03F"]);

    // Clear previous SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; background: #fff");

    // Add zoom behavior
    zoomRef.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        svg.attr("transform", event.transform);
      });

    svg.call(zoomRef.current);

    // Create a group for zooming
    const g = svg.append("g");

    // Force simulation
    const newSimulation = d3
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

    simulationRef.current = newSimulation;

    // Links
    const link = g
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", "#000")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,3");

    // Link text
    const linkText = g
      .append("g")
      .selectAll("text")
      .data(graphData.links)
      .join("text")
      .text((d) => d.info)
      .attr("font-size", 10)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .attr("dy", -3);

    // Nodes
    const node = g
      .append("g")
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", (d) => color(d.group.toString()))
      .attr("stroke", "#000")
      .attr("stroke-width", 3)
      .on("click", (event, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
          event.stopPropagation();
        }
      });

    // Node labels
    const nodeLabel = g
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text((d) => {
        const id = d.id;
        return id.length > 20 ? id.substring(0, 17) + "..." : id;
      })
      .attr("font-size", 10)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .attr("dy", -20);

    // Enable node dragging
    node.call(
      d3
        .drag<SVGCircleElement, NodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) newSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) newSimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // Update positions on each tick
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

      nodeLabel.attr("x", (d) => d.x!).attr("y", (d) => d.y! - 20);
    }

    newSimulation.on("tick", ticked);

    // Cleanup
    return () => {
      newSimulation.stop();
    };
  }, [documents, width, height, onNodeClick]);

  // Implementación de las funciones de control
  const zoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const zoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.8);
    }
  };

  const resetView = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .call(zoomRef.current.transform, d3.zoomIdentity);
      transformRef.current = d3.zoomIdentity;
    }
  };

  return {
    svgRef,
    simulation: simulationRef.current,
    zoomIn,
    zoomOut,
    resetView,
  };
}
