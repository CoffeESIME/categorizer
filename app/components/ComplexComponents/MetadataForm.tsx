"use client";

import React from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import BrutalButton from "../ButtonComponent/ButtonComponent";

interface MetadataFormProps {
  metadata: any;
  autoFields: {
    author: boolean;
    title: boolean;
    content: boolean;
    tags: boolean;
    sentiment: boolean;
  };
  toggleAutoField: (field: string) => void;
  updateMetadata: (updates: Partial<any>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  metadata,
  autoFields,
  toggleAutoField,
  updateMetadata,
  addTag,
  removeTag,
}) => {
  if (!metadata) return null;

  return (
    <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold">Metadatos del Archivo</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* === AUTHOR === */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Autor</label>
          </div>
          <BrutalInput
            type="text"
            placeholder="Autor del contenido"
            value={metadata.author || ""}
            onChange={(e) => updateMetadata({ author: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>

        {/* === TITLE === */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Título</label>
          </div>
          <BrutalInput
            type="text"
            placeholder="Título del contenido"
            value={metadata.title || ""}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            className="w-full bg-white"
          />
        </div>

        {/* === CONTENT (antes "Descripción") === */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Contenido</label>
          </div>
          <BrutalInput
            type="textarea"
            placeholder="Contenido del archivo"
            value={metadata.content || ""}
            onChange={(e) => updateMetadata({ content: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg h-32"
            multiline
          />
        </div>

        {/* === SENTIMENT === */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Sentimiento</label>
          </div>
          <BrutalInput
            type="text"
            placeholder="Sentimiento (ej: positivo, negativo...)"
            value={metadata.sentiment || ""}
            onChange={(e) => updateMetadata({ sentiment: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>

        {/* === TAGS === */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Tags</label>
          </div>
          <div className="flex space-x-2">
            <BrutalInput
              type="text"
              id="tagInput"
              placeholder="Agregar tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTag((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              className="flex-1 p-2 border-4 border-black rounded-lg"
            />
            <BrutalButton
              onClick={() => {
                const input = document.getElementById(
                  "tagInput"
                ) as HTMLInputElement;
                addTag(input.value);
                input.value = "";
              }}
              variant="teal"
            >
              +
            </BrutalButton>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.tags?.map((tag: string) => (
              <span
                key={tag}
                className="bg-blue-200 border-2 border-black px-2 py-1 rounded-lg flex items-center"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {metadata.extractedText && (
          <div>
            <label className="font-bold">Texto Extraído</label>
            <div className="mt-1 p-2 border-4 border-black rounded-lg bg-gray-100 max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">
                {metadata.extractedText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
