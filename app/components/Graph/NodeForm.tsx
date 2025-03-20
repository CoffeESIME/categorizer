import React, { useState, useEffect } from "react";
import { BrutalInput } from "../InputComponent/InputComponent";
import { BrutalButton } from "../ButtonComponent/ButtonComponent";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
import categorizerAPI from "../../utils/categorizerAPI";

// Definición de tipos para los campos y tipos de nodo
interface NodeField {
  fieldName: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
}

export interface NodeType {
  id: string;
  name: string;
  fields: NodeField[];
}

export interface CreateNodeData {
  type: NodeType | null;
  properties: Record<string, string>;
}

interface CreateNodeWithTypeFormProps {
  onCreateNode: (data: CreateNodeData) => void;
}

export function CreateNodeWithTypeForm({
  onCreateNode,
}: CreateNodeWithTypeFormProps) {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [properties, setProperties] = useState<Record<string, string>>({});

  // Cargar los tipos de nodo predefinidos desde el backend
  useEffect(() => {
    async function fetchNodeTypes() {
      try {
        const types: NodeType[] = await categorizerAPI.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error("Error fetching node types", error);
      }
    }
    fetchNodeTypes();
  }, []);

  // Manejar cambios en los valores de las propiedades dinámicas
  const handlePropertyChange = (fieldName: string, value: string) => {
    setProperties((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Manejar selección del tipo desde el dropdown
  const handleTypeSelect = (value: string) => {
    const type = nodeTypes.find((t) => t.id === value) || null;
    setSelectedType(type);
    setProperties({}); // Reiniciar las propiedades al cambiar el tipo
  };

  // Al crear el nodo se envía el tipo seleccionado y las propiedades
  const handleCreate = () => {
    onCreateNode({ type: selectedType, properties });
  };

  return (
    <div className="p-4 border-4 border-black rounded-lg bg-white">
      <label className="font-bold block mb-2">Seleccionar tipo de nodo:</label>
      <BrutalDropDown
        buttonLabel={selectedType ? selectedType.name : "Seleccionar tipo"}
        options={nodeTypes.map((type) => ({
          label: type.name,
          value: type.id,
        }))}
        onSelect={handleTypeSelect}
      />

      {selectedType && (
        <div className="mt-4">
          <label className="font-bold block mb-2">
            Propiedades para el tipo "{selectedType.name}":
          </label>
          {selectedType.fields.map((field) => (
            <div key={field.fieldName} className="mb-2">
              <BrutalInput
                type="text"
                placeholder={field.placeholder || field.fieldName}
                value={properties[field.fieldName] || field.defaultValue || ""}
                onChange={(e) =>
                  handlePropertyChange(field.fieldName, e.target.value)
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      <BrutalButton
        onClick={handleCreate}
        variant="blue"
        className="mt-4 w-full"
      >
        Crear nodo
      </BrutalButton>
    </div>
  );
}
