import React, { useState, useEffect } from "react";
import { DocumentNode } from "@/app/visualizer/page";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import { BrutalButton } from "../ButtonComponent/ButtonComponent";
import categorizerAPI from "@/app/utils/categorizerAPI";

async function createOrGetNodeByName(name: string): Promise<DocumentNode> {
  // Puedes hacer una llamada POST /api/nodes con { name }
  // y el backend se encarga de retornar el nodo si ya existe
  const response = await fetch("/api/nodes", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error al crear/obtener el nodo");
  }
  return await response.json();
}
/**
 * El componente que muestra los detalles (y edición) de un nodo.
 */
export const NodeDetailsPanel: React.FC<{
  selectedNode: DocumentNode | null;
  onClose: () => void;
}> = ({ selectedNode, onClose }) => {
  // Estado para modo edición
  const [isEditing, setIsEditing] = useState(false);

  // Lista de nodos a los que se puede conectar
  const [possibleConnections, setPossibleConnections] = useState<
    DocumentNode[]
  >([]);

  // Nodo que el usuario selecciona para conectar
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);

  // Nombre de un nuevo nodo a crear
  const [newNodeName, setNewNodeName] = useState("");

  // Conexiones actuales del nodo seleccionado
  const [currentConnections, setCurrentConnections] = useState<DocumentNode[]>(
    []
  );

  // Cargar posibles conexiones y conexiones actuales al montar (o cuando cambie selectedNode).
  useEffect(() => {
    if (selectedNode && selectedNode.doc_id) {
      // Cargar posibles conexiones utilizando categorizerAPI
      // categorizerAPI
      //   .fetchPossibleConnections()
      //   .then((data) => setPossibleConnections(data))
      //   .catch((err) =>
      //     console.error("Error al cargar conexiones posibles:", err)
      //   );
      // // Cargar conexiones actuales utilizando categorizerAPI
      // categorizerAPI
      //   .fetchNodeConnections(selectedNode.doc_id)
      //   .then((data) => setCurrentConnections(data))
      //   .catch((err) =>
      //     console.error("Error al cargar conexiones actuales:", err)
      //   );
    }
  }, [selectedNode]);
  if (!selectedNode) return null;

  // Helpers para formatear campos cuando no estamos en edición
  const formatField = (name: string, value: any) => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value) && value.length === 0) return null;

    return (
      <div className="mb-2" key={name}>
        <span className="font-bold">{name}: </span>
        {Array.isArray(value) ? value.join(", ") : value}
      </div>
    );
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleCreateNode = async () => {
    if (!newNodeName.trim()) return;
    try {
      // Crea o recupera el nodo
      const newNode = await createOrGetNodeByName(newNodeName.trim());
      // Podrías actualizar la lista local de conexiones para que aparezca este nuevo nodo.
      setPossibleConnections((prev) => [...prev, newNode]);
      setNewNodeName("");
      alert(`Nodo "${newNodeName}" creado o recuperado con éxito`);
    } catch (error) {
      console.error(error);
      alert("Error creando nodo");
    }
  };

  const handleConnectSelectedNode = async () => {
    if (!selectedNode.doc_id || !selectedConnectionId) return;
    try {
      await categorizerAPI.updateNodeConnection(
        selectedNode.doc_id,
        selectedConnectionId
      );
      // Actualizar las conexiones actuales en la interfaz
      const newConnection = possibleConnections.find(
        (node) => node.doc_id === selectedConnectionId
      );
      if (newConnection) {
        setCurrentConnections((prev) => [...prev, newConnection]);
      }
      alert(`Conexión realizada con el nodo ${selectedConnectionId}`);
    } catch (error) {
      console.error(error);
      alert("Error en la conexión");
    }
  };

  const handleDeleteConnection = async (connectionNodeId: string) => {
    if (!selectedNode.doc_id) return;
    try {
      await categorizerAPI.deleteNodeConnection(
        selectedNode.doc_id,
        connectionNodeId
      );
      // Actualizar el estado local eliminando la conexión
      setCurrentConnections((prevConnections) =>
        prevConnections.filter((conn) => conn.doc_id !== connectionNodeId)
      );
      alert("Conexión eliminada con éxito");
    } catch (error) {
      console.error("Error al eliminar la conexión:", error);
      alert("Error al eliminar la conexión");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white border-4 border-black p-6 rounded-md max-w-2xl w-full max-h-[80vh] overflow-y-auto transform rotate-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Editar Nodo" : "Document Details"}
          </h2>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 border-2 border-black"
          >
            X
          </button>
        </div>

        {/* Si NO estamos en edición, mostramos la información normal */}
        {!isEditing && (
          <div className="space-y-1">
            {formatField("Document ID", selectedNode.doc_id)}
            {formatField("Title", selectedNode.title)}
            {formatField("Author", selectedNode.author)}
            {formatField("Work", selectedNode.work)}
            {formatField("Content Type", selectedNode.content_type)}
            {formatField("Languages", selectedNode.languages)}
            {formatField("Sentiment", selectedNode.sentiment_word)}
            {formatField("Categories", selectedNode.categories)}
            {formatField("Keywords", selectedNode.keywords)}
            {formatField("Tags", selectedNode.tags)}
            {formatField("Topics", selectedNode.topics)}
            {formatField("Style", selectedNode.style)}
            {formatField("Labels", selectedNode.labels)}
          </div>
        )}

        {/* Modo edición: aquí el usuario puede crear un nuevo nodo o conectar a un nodo existente */}
        {isEditing && (
          <div className="space-y-4">
            <p className="font-bold text-lg">Opciones de Conexión</p>

            {/* Lista de conexiones actuales con opción para eliminar */}
            {currentConnections.length > 0 && (
              <div className="mb-4">
                <label className="font-bold block mb-2">
                  Conexiones actuales:
                </label>
                <div className="space-y-2">
                  {currentConnections.map((connection) => (
                    <div
                      key={connection.doc_id}
                      className="flex items-center justify-between p-2 border-2 border-black rounded"
                    >
                      <span>
                        {connection.title ||
                          `Nodo sin título (ID: ${connection.doc_id})`}
                      </span>
                      <BrutalButton
                        onClick={() =>
                          handleDeleteConnection(connection.doc_id)
                        }
                        variant="red"
                        className="ml-2"
                      >
                        Eliminar
                      </BrutalButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown con nodos existentes */}
            <div>
              <label className="font-bold block mb-1">
                Posibles nodos a conectar:
              </label>
              <BrutalDropDown
                buttonLabel={
                  selectedConnectionId
                    ? possibleConnections.find(
                        (option) => option.doc_id === selectedConnectionId
                      )?.title || "Seleccionar"
                    : "Seleccionar"
                }
                options={possibleConnections.map((option) => ({
                  value: option.doc_id,
                  label:
                    option.title || `Nodo sin título (ID: ${option.doc_id})`,
                }))}
                onSelect={(value: any) => {
                  setSelectedConnectionId(value);
                }}
              />
              <BrutalButton
                onClick={handleConnectSelectedNode}
                variant="purple"
                className="mt-2 w-full"
              >
                Conectar al nodo seleccionado
              </BrutalButton>
            </div>

            <hr className="border-black" />

            {/* Crear un nuevo nodo */}
            <div>
              <label className="font-bold block mb-1">Crear nuevo nodo:</label>
              <BrutalInput
                type="text"
                placeholder="Nombre del nuevo nodo"
                value={newNodeName}
                onChange={(e: any) => setNewNodeName(e.target.value)}
                className="w-full p-2 border-4 border-black rounded-lg"
              />
              <BrutalButton
                onClick={handleCreateNode}
                variant="blue"
                className="mt-2 w-full"
              >
                Crear nodo
              </BrutalButton>
            </div>
          </div>
        )}

        {/* Botón para cambiar entre modo edición y no edición */}
        <div className="flex justify-end mt-4">
          <BrutalButton
            onClick={handleEditClick}
            variant={isEditing ? "blue" : "purple"}
          >
            {isEditing ? "Terminar" : "Editar"}
          </BrutalButton>
        </div>
      </div>
    </div>
  );
};
