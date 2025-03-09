"use client";

import React from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import BrutalButton from "../ButtonComponent/ButtonComponent";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";

interface ProcessOptionsProps {
  currentFile: any;
  isProcessing: boolean;
  processWithOCR: () => void;
  processWithLLM: () => void;
  autoFields: {
    author: boolean;
    title: boolean;
    description: boolean;
    tags: boolean;
  };
  toggleAutoField: (field: string) => void;
  llmConfig: { model: string; temperature: number; maxTokens: number };
  setLlmConfig: (config: any) => void;
  llmModelOptions: { label: string; value: string }[];
  getProcessingOptions: (file: any) => string[];
}

export const ProcessOptions: React.FC<ProcessOptionsProps> = ({
  currentFile,
  isProcessing,
  processWithOCR,
  processWithLLM,
  autoFields,
  toggleAutoField,
  llmConfig,
  setLlmConfig,
  llmModelOptions,
  getProcessingOptions,
}) => {
  if (!currentFile) return null;
  const processingOptions = getProcessingOptions(currentFile);

  return (
    <div className="border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold mb-2">Opciones de procesamiento</h3>
      <div className="space-y-3">
        {processingOptions.includes("ocr") && (
          <BrutalButton
            onClick={processWithOCR}
            disabled={isProcessing}
            variant="blue"
            className="w-full"
          >
            {isProcessing ? "Procesando..." : "OCR"}
          </BrutalButton>
        )}
        {processingOptions.includes("llm") && (
          <BrutalButton
            onClick={processWithLLM}
            disabled={isProcessing}
            variant="purple"
            className="w-full"
          >
            {isProcessing ? "Procesando..." : "Analizar con LLM"}
          </BrutalButton>
        )}
        <div className="mt-4 p-3 border-2 border-black rounded-lg bg-yellow-100">
          <h4 className="font-bold">Campos a extraer automáticamente:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <CustomCheckbox
              checked={autoFields.author}
              onChange={() => toggleAutoField("author")}
              label="Autor"
            />
            <CustomCheckbox
              checked={autoFields.title}
              onChange={() => toggleAutoField("title")}
              label="Título"
            />
            <CustomCheckbox
              checked={autoFields.description}
              onChange={() => toggleAutoField("description")}
              label="Descripción"
            />
            <CustomCheckbox
              checked={autoFields.tags}
              onChange={() => toggleAutoField("tags")}
              label="Tags"
            />
          </div>
        </div>
        <div className="mt-4 p-3 border-2 border-black rounded-lg bg-yellow-100">
          <h4 className="font-bold">Configuración del LLM:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <div>
              <label className="font-bold">Modelo</label>
              <BrutalDropDown
                buttonLabel={llmConfig.model}
                options={llmModelOptions}
                onSelect={(value) => setLlmConfig({ model: value })}
              />
            </div>
          </div>
          <div>
            <label className="font-bold">Temperatura</label>
            <BrutalInput
              type="number"
              placeholder="Temperatura"
              value={llmConfig.temperature}
              onChange={(e) =>
                setLlmConfig({ temperature: parseFloat(e.target.value) })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
          <div>
            <label className="font-bold">Máx Tokens</label>
            <BrutalInput
              type="number"
              placeholder="Máx Tokens"
              value={llmConfig.maxTokens}
              onChange={(e) =>
                setLlmConfig({ maxTokens: parseInt(e.target.value, 10) })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
