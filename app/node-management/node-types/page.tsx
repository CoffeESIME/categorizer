"use client";

import React, { useEffect, useState } from "react";
import { NodeType, NodeField } from "@/app/types/nodeTypes";
import categorizerAPI from "@/app/utils/categorizerAPI";
import { BrutalButton } from "@/app/components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "@/app/components/InputComponent/InputComponent";
import { TitleComponent } from "@/app/components/TitleComponent/TtitleComponent";
import { ButtonLink } from "@/app/components/ButtonLink/ButtonLink";
import CustomCheckbox from "@/app/components/CheckBoxComponent/CheckBoxComponent";
import BrutalDropDown from "@/app/components/DropDownComponent/DropdownComponent";

export default function NodeTypesView() {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState<string>("");
  const [newTypeId, setNewTypeId] = useState<string>("");
  const [newTypeFields, setNewTypeFields] = useState<NodeField[]>([
    {
      fieldName: "",
      placeholder: "",
      type: "text",
      required: false,
    },
  ]);

  useEffect(() => {
    async function fetchNodeTypes() {
      try {
        setLoading(true);
        const types = await categorizerAPI.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error("Error al cargar tipos de nodos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNodeTypes();
  }, []);

  const handleSelectType = (type: NodeType) => {
    setSelectedType(type);
    setIsEditing(false);
  };

  const handleAddField = () => {
    setNewTypeFields([
      ...newTypeFields,
      {
        fieldName: "",
        placeholder: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const handleFieldChange = (index: number, field: Partial<NodeField>) => {
    const updatedFields = [...newTypeFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setNewTypeFields(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = newTypeFields.filter((_, i) => i !== index);
    setNewTypeFields(updatedFields);
  };

  const handleCreateType = async () => {
    // Implementar la creación de un nuevo tipo de nodo cuando se tenga la API correspondiente
    console.log("Crear tipo:", {
      id: newTypeId,
      name: newTypeName,
      fields: newTypeFields,
    });

    // Aquí iría la llamada a la API para crear un nuevo tipo
    // await categorizerAPI.createNodeType({ id: newTypeId, name: newTypeName, fields: newTypeFields });

    // Recargar los tipos
    // const types = await categorizerAPI.getNodeTypes();
    // setNodeTypes(types);

    // Limpiar formulario
    setNewTypeName("");
    setNewTypeId("");
    setNewTypeFields([
      { fieldName: "", placeholder: "", type: "text", required: false },
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <TitleComponent title="Tipos de Nodos" />
        <ButtonLink href="/" label="Volver al Inicio" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Lista de tipos */}
        <div className="lg:col-span-1 border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Tipos disponibles</h2>
          {loading ? (
            <p>Cargando tipos de nodos...</p>
          ) : (
            <div className="space-y-2">
              {nodeTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 border-2 cursor-pointer ${
                    selectedType?.id === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-black"
                  }`}
                  onClick={() => handleSelectType(type)}
                >
                  <h3 className="font-bold">{type.name}</h3>
                  <p className="text-sm">ID: {type.id}</p>
                  <p className="text-xs">
                    {type.fields.length} campo(s) definido(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel central: Detalles del tipo seleccionado */}
        <div className="lg:col-span-1 border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Detalles del tipo</h2>
          {selectedType ? (
            <div>
              <div className="mb-4">
                <strong>Nombre:</strong> {selectedType.name}
              </div>
              <div className="mb-4">
                <strong>ID:</strong> {selectedType.id}
              </div>
              <div>
                <strong>Campos:</strong>
                <ul className="mt-2 space-y-2">
                  {selectedType.fields.map((field, index) => (
                    <li
                      key={index}
                      className="p-2 border-2 border-black rounded-md"
                    >
                      <div>
                        <strong>Nombre:</strong> {field.fieldName}
                      </div>
                      {field.placeholder && (
                        <div>
                          <strong>Placeholder:</strong> {field.placeholder}
                        </div>
                      )}
                      {field.type && (
                        <div>
                          <strong>Tipo:</strong> {field.type}
                        </div>
                      )}
                      <div>
                        <strong>Requerido:</strong>{" "}
                        {field.required ? "Sí" : "No"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Selecciona un tipo para ver sus detalles</p>
          )}
        </div>

        {/* Panel derecho: Crear nuevo tipo */}
        <div className="lg:col-span-1 border-4 border-black p-4 rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Crear nuevo tipo</h2>
          <div className="space-y-4">
            <div>
              <label className="font-bold block mb-1">ID del tipo:</label>
              <BrutalInput
                type="text"
                value={newTypeId}
                onChange={(e) => setNewTypeId(e.target.value)}
                placeholder="Identificador único (ej: author)"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Nombre del tipo:</label>
              <BrutalInput
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Nombre descriptivo (ej: Autor)"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Campos:</label>
              {newTypeFields.map((field, index) => (
                <div key={index} className="mb-4 p-3 border-2 border-black">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold">Campo #{index + 1}</h4>
                    <BrutalButton
                      onClick={() => handleRemoveField(index)}
                      variant="red"
                    >
                      Eliminar
                    </BrutalButton>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">
                      Nombre del campo:
                    </label>
                    <BrutalInput
                      type="text"
                      value={field.fieldName}
                      onChange={(e) =>
                        handleFieldChange(index, {
                          fieldName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Placeholder:</label>
                    <BrutalInput
                      type="text"
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        handleFieldChange(index, {
                          placeholder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Tipo:</label>
                    <BrutalDropDown
                      buttonLabel={field.type || "text"}
                      options={[
                        { label: "Texto", value: "text" },
                        { label: "Número", value: "number" },
                        { label: "Fecha", value: "date" },
                        { label: "Checkbox", value: "checkbox" },
                        { label: "Área de texto", value: "textarea" },
                      ]}
                      onSelect={(value: string) =>
                        handleFieldChange(index, { type: value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <CustomCheckbox
                      label="Campo requerido"
                      defaultChecked={field.required || false}
                      onChange={() =>
                        handleFieldChange(index, {
                          required: !field.required,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
              <BrutalButton
                onClick={handleAddField}
                variant="green"
                className="w-full mt-2"
              >
                + Añadir campo
              </BrutalButton>
            </div>
            <BrutalButton
              onClick={handleCreateType}
              variant="blue"
              className="w-full mt-4"
            >
              Crear tipo de nodo
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
