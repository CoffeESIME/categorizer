"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  ComponentType, // Import ComponentType
} from "react";
import {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node, // This is React Flow's Node type: Node<TData>
  MarkerType,
  ReactFlowProvider,
  ReactFlow,
  NodeProps as RFNodeProps, // Use an alias for NodeProps from React Flow
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { NodeDetailsPanel } from "../components/Graph/NodeComponent";
import categorizerAPI from "../utils/categorizerAPI";
import { CreateNodeWithTypeForm } from "../components/Graph/NodeForm";
import { Modal } from "../components/Modal/Modal";
import { CreateNodeData, DocumentNode } from "../types/nodeTypes"; // Your data type
import { GraphEdge as ApiGraphEdge } from "../types/graphTypes";
import ReactFlowNode from "../components/Graph/ReactFlowNode";

type GraphMode = "unconnected" | "full";

const getNodeLabel = (nodeData: DocumentNode): string => {
  if (nodeData.title) return nodeData.title;
  if ("name" in nodeData && (nodeData as any).name)
    return (nodeData as any).name;
  return nodeData.doc_id || nodeData.id || "Node";
};

export default function DocumentGraphVisualization() {
  const [graphMode, setGraphMode] = useState<GraphMode>("full");

  // State for React Flow nodes and edges
  // Node<DocumentNode> means each node object has a `data` property of type DocumentNode
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DocumentNode>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]); // Edges are generally just Edge[]
  console.log("nodes and edges", nodes, edges);
  const [selectedNodeForPanel, setSelectedNodeForPanel] =
    useState<DocumentNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState<boolean>(false);

  // Correctly type nodeTypes for React Flow
  const nodeTypes = useMemo(
    () => ({
      customNode: ReactFlowNode as ComponentType<RFNodeProps>, // Cast to ComponentType<NodeProps<any>>
    }),
    []
  );

  const loadGraphData = useCallback(
    async (mode: GraphMode) => {
      setLoading(true);
      setSelectedNodeForPanel(null);
      try {
        let currentApiNodes: DocumentNode[] = [];
        let currentApiEdges: ApiGraphEdge[] = [];

        if (mode === "unconnected") {
          currentApiNodes = await categorizerAPI.getUnconnectedNodes();
          currentApiEdges = [];
        } else {
          const allData = await categorizerAPI.fetchGraphData();
          currentApiNodes = allData.nodes;
          currentApiEdges = allData.edges;
        }

        const rfNodes: Node<DocumentNode>[] = currentApiNodes.map(
          (docNode, index) => ({
            id: docNode.doc_id || docNode.id, // Use your domain ID for React Flow node ID
            type: "customNode",
            position: {
              x: (index % 10) * 280, // Adjusted spacing
              y: Math.floor(index / 10) * 180, // Adjusted spacing
            },
            data: docNode, // The 'data' prop gets your DocumentNode
          })
        );

        const rfEdges: Edge[] = currentApiEdges.map((apiEdge, index) => ({
          id: `e-${apiEdge.source}-${apiEdge.target}-${
            apiEdge.relation || "rel"
          }-${index}`,
          source: apiEdge.source,
          target: apiEdge.target,
          label: apiEdge.relation,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { strokeWidth: 2 },
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      } catch (error) {
        console.error(`Error fetching ${mode} graph data:`, error);
        setNodes([]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    loadGraphData(graphMode);
  }, [graphMode, loadGraphData]);

  // The `node` parameter here is of type Node<DocumentNode>
  const onNodeClickInternal = useCallback(
    (event: React.MouseEvent, node: Node<DocumentNode>) => {
      setSelectedNodeForPanel(node.data); // Pass the DocumentNode data to the panel
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = () => {
    setIsAddNodeModalOpen(true);
  };

  const handleCreateNode = async (data: CreateNodeData) => {
    try {
      await categorizerAPI.createNode(data);
      setIsAddNodeModalOpen(false);
      loadGraphData(graphMode); // Refresh graph
    } catch (error) {
      console.error("Error creando nodo:", error);
    }
  };

  const handleModeSwitch = () => {
    setGraphMode((prev) => (prev === "unconnected" ? "full" : "unconnected"));
  };

  return (
    <ReactFlowProvider>
      <div className="flex min-h-screen border-4 border-black bg-white">
        <div className="w-1/4 border-r-4 border-black p-4 bg-[#FFD6E8] flex flex-col gap-4">
          <TitleComponent title="Document Graph" variant="yellow" />
          <BrutalButton variant="blue" onClick={handleAddNode}>
            Agregar Nodo
          </BrutalButton>
          <BrutalButton variant="orange" onClick={handleModeSwitch}>
            Modo:{" "}
            {graphMode === "unconnected" ? "Sin conexiones" : "Grafo completo"}
          </BrutalButton>
          <ButtonLink href="/advanced_graph_search" variant="outline" size="lg">
            <p className="text-xl">Búsqueda Avanzada</p>
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            <p className="text-xl">Home</p>
          </ButtonLink>
        </div>

        <div className="flex-1 p-4 bg-[#FFFCD6] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              Cargando datos del grafo...
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClickInternal}
              nodeTypes={nodeTypes} // This should now be type-correct
              fitView
              className="bg-white border-4 border-black rounded-md"
            >
              <Controls />
              <Background />
            </ReactFlow>
          )}
        </div>

        {isAddNodeModalOpen && (
          <Modal onClose={() => setIsAddNodeModalOpen(false)}>
            <CreateNodeWithTypeForm onCreateNode={handleCreateNode} />
          </Modal>
        )}

        {selectedNodeForPanel && (
          <NodeDetailsPanel
            selectedNode={selectedNodeForPanel}
            onClose={() => setSelectedNodeForPanel(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}
