"use client";

import React, { useEffect, useState } from "react";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { NodeDetailsPanel } from "../components/Graph/NodeComponent";
import categorizerAPI from "../utils/categorizerAPI";
import { CreateNodeWithTypeForm } from "../components/Graph/NodeForm";
import { FilterForm } from "../components/Graph/FilterForm";
import { Modal } from "../components/Modal/Modal";
import { useDocumentGraph } from "../lib/useDocumentGraph";
import { useHeterogeneousGraph } from "../lib/useHeterogeneousGraph";
import { CreateNodeData, DocumentNode } from "../types/nodeTypes";
import { GraphEdge } from "../types/graphTypes";
type GraphMode = "unconnected" | "full";

export default function DocumentGraphVisualization() {
  const [graphMode, setGraphMode] = useState<GraphMode>("unconnected");
  const [selectedNode, setSelectedNode] = useState<DocumentNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [unconnectedNodes, setUnconnectedNodes] = useState<DocumentNode[]>([]);
  const [fullGraphNodes, setFullGraphNodes] = useState<DocumentNode[]>([]);
  const [fullGraphEdges, setFullGraphEdges] = useState<GraphEdge[]>([]);

  async function loadUnconnectedNodes() {
    try {
      setLoading(true);
      const response: DocumentNode[] =
        await categorizerAPI.getUnconnectedNodes();
      setUnconnectedNodes(response);
    } catch (error) {
      console.error("Error fetching unconnected nodes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFullGraph() {
    try {
      setLoading(true);
      const allData = await categorizerAPI.fetchGraphData();
      setFullGraphNodes(allData.nodes);
      setFullGraphEdges(allData.edges);
    } catch (error) {
      console.error("Error fetching full graph data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (graphMode === "unconnected") {
      loadUnconnectedNodes();
    } else {
      loadFullGraph();
    }
  }, [graphMode]);

  const unconnectedGraph = useDocumentGraph({
    documents: unconnectedNodes,
    edges: [],
    onNodeClick: (node) => {
      setSelectedNode(node);
    },
  });

  const fullGraph = useHeterogeneousGraph({
    nodes: fullGraphNodes,
    edges: fullGraphEdges,
    onNodeClick: (nodeData) => {
      setSelectedNode(nodeData as DocumentNode);
    },
  });
  const handleAddNode = () => {
    setIsAddNodeModalOpen(true);
  };

  const handleCreateNode = async (data: CreateNodeData) => {
    try {
      await categorizerAPI.createNode(data);
      setIsAddNodeModalOpen(false);
      if (graphMode === "unconnected") {
        loadUnconnectedNodes();
      } else {
        loadFullGraph();
      }
    } catch (error) {
      console.error("Error creando nodo:", error);
    }
  };

  const handleFilter = () => {
    alert(`Filtrando grafo con criterio: ${filter}`);
    setIsFilterModalOpen(true);
  };

  const handleModeSwitch = () => {
    setGraphMode((prev) => (prev === "unconnected" ? "full" : "unconnected"));
  };

  return (
    <div className="flex min-h-screen border-4 border-black bg-white">
      <div className="w-1/4 border-r-4 border-black p-4 bg-[#FFD6E8]  origin-top-left transform flex flex-col gap-4">
        <TitleComponent title="Document Graph" variant="yellow" />

        <BrutalButton variant="blue" onClick={handleAddNode}>
          Agregar Nodo
        </BrutalButton>

        <BrutalButton variant="green" onClick={handleFilter}>
          Filtrar
        </BrutalButton>

        <BrutalButton variant="orange" onClick={handleModeSwitch}>
          Modo:{" "}
          {graphMode === "unconnected" ? "Sin conexiones" : "Grafo completo"}
        </BrutalButton>

        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>

      <div className="flex-1 p-4 bg-[#FFFCD6]  origin-top-left transform">
        <div className="border-4 border-black p-2 rounded-md bg-[#FFFFFF]">
          {loading ? (
            <p className="text-center">Cargando datos...</p>
          ) : graphMode === "unconnected" ? (
            <svg ref={unconnectedGraph.svgRef} />
          ) : (
            <svg ref={fullGraph.svgRef} />
          )}
        </div>
      </div>

      {isAddNodeModalOpen && (
        <Modal onClose={() => setIsAddNodeModalOpen(false)}>
          <CreateNodeWithTypeForm onCreateNode={handleCreateNode} />
        </Modal>
      )}

      {isFilterModalOpen && (
        <Modal onClose={() => setIsFilterModalOpen(false)}>
          <FilterForm
            filter={filter}
            setFilter={setFilter}
            handleFilter={handleFilter}
          />
        </Modal>
      )}

      <NodeDetailsPanel
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
