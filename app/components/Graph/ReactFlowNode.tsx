"use client";

import React, { memo, useMemo } from "react";
import {
  Handle,
  Position,
  NodeProps as RFNodeProps,
  NodeResizer,
} from "@xyflow/react";
import { DocumentNode } from "@/app/types/nodeTypes";

// Helper to get a display name or title
const getNodeTitle = (nodeData: DocumentNode): string => {
  if (nodeData.title) return nodeData.title;
  // Ensure 'name' is checked if it exists on DocumentNode or its extensions
  if ("name" in nodeData && (nodeData as any).name)
    return (nodeData as any).name;
  return nodeData.id || nodeData.doc_id || "Node";
};

// Use the general RFNodeProps (NodeProps<any>)
const ReactFlowNode: React.FC<RFNodeProps> = ({
  data, // data will be 'any' here, so we cast it
  selected,
  id, // This is the React Flow node ID
  // You can destructure other standard NodeProps if needed:
  // xPos, yPos, type, isConnectable, dragging, zIndex, etc.
}) => {
  // Cast data to DocumentNode for use within the component
  const nodeData = data as DocumentNode;

  const initialFields = useMemo(() => {
    const fields: { label: string; value: string | undefined | string[] }[] =
      [];
    fields.push({
      label: "ID",
      // Use nodeData which is now typed as DocumentNode
      value: nodeData.id || nodeData.doc_id,
    });
    fields.push({ label: "Title", value: getNodeTitle(nodeData) });
    if (nodeData.labels && nodeData.labels.length > 0) {
      fields.push({ label: "Label", value: nodeData.labels[0] });
    } else if (nodeData.content_type) {
      fields.push({ label: "Type", value: nodeData.content_type });
    }
    return fields.slice(0, 3);
  }, [nodeData]);

  const expandedFields = useMemo(() => {
    const fields: { label: string; value: any }[] = [];
    if (nodeData.author)
      fields.push({ label: "Author", value: nodeData.author });
    if (nodeData.work) fields.push({ label: "Work", value: nodeData.work });
    if (nodeData.content_type)
      fields.push({ label: "Content Type", value: nodeData.content_type });
    if (nodeData.tags && nodeData.tags.length > 0)
      fields.push({ label: "Tags", value: nodeData.tags.join(", ") });
    if (nodeData.sentiment_word)
      fields.push({ label: "Sentiment", value: nodeData.sentiment_word });
    if (nodeData.categories && nodeData.categories.length > 0)
      fields.push({
        label: "Categories",
        value: nodeData.categories.join(", "),
      });
    if (nodeData.keywords && nodeData.keywords.length > 0)
      fields.push({
        label: "Keywords",
        value: nodeData.keywords.join(", "),
      });
    return fields;
  }, [nodeData]);

  const nodeStyle: React.CSSProperties = {
    border: selected ? "3px solid #3b82f6" : "2px solid #000",
    background: selected ? "#eff6ff" : "#fff",
    borderRadius: "8px",
    padding: "10px",
    width: selected ? 300 : 200,
    minHeight: selected ? 150 : 100,
    transition:
      "width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
    fontSize: "12px",
    boxShadow: selected
      ? "0 4px 12px rgba(0,0,0,0.15)"
      : "0 2px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div style={nodeStyle}>
      <NodeResizer
        color="#3b82f6"
        isVisible={selected}
        minWidth={180}
        minHeight={80}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "5px",
          borderBottom: "1px solid #eee",
          paddingBottom: "5px",
        }}
      >
        {/* Use the React Flow node ID here for the main title if desired, or title from data */}
        {getNodeTitle(nodeData)}
      </div>
      {!selected &&
        initialFields.map((field) => (
          <div
            key={field.label}
            style={{
              marginBottom: "3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <strong>{field.label}:</strong>{" "}
            {Array.isArray(field.value) ? field.value.join(", ") : field.value}
          </div>
        ))}
      {selected && (
        <>
          {initialFields.map((field) => (
            <div
              key={`initial-${field.label}`}
              style={{
                marginBottom: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <strong>{field.label}:</strong>{" "}
              {Array.isArray(field.value)
                ? field.value.join(", ")
                : field.value}
            </div>
          ))}
          <hr style={{ margin: "5px 0" }} />
          {expandedFields.map((field) => (
            <div
              key={field.label}
              style={{
                marginBottom: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <strong>{field.label}:</strong> {field.value}
            </div>
          ))}
        </>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export default memo(ReactFlowNode);
