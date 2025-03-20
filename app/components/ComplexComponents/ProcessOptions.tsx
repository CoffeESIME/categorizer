"use client";

import React, { useState, useEffect } from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import BrutalButton from "../ButtonComponent/ButtonComponent";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
interface AutoFields {
  [key: string]: boolean;
  author: boolean;
  title: boolean;
  content: boolean;
  tags: boolean;
  sentiment: boolean;
}
interface ProcessOptionsProps {
  currentFile: any;
  isProcessing: boolean;
  processWithOCR: () => void;
  processWithLLM: () => void;
  autoFields: AutoFields;
  toggleAutoField: (field: string) => void;
  llmConfig: {
    model: string;
    temperature: number;
  };
  setLlmConfig: (config: any) => void;
  llmModelOptions: { label: string; value: string }[];
  getProcessingOptions: (file: any) => string[];
  updateMetadata: (updates: any) => void;
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
  updateMetadata,
}) => {
  if (!currentFile) return null;
  const availableProcessingOptions = getProcessingOptions(currentFile);
  const [selectedProcessingOption, setSelectedProcessingOption] =
    useState<string>("");
  const [renderFields, setRenderFields] = useState<string[]>([]);
  useEffect(() => {
    if (availableProcessingOptions.length > 0) {
      setSelectedProcessingOption(availableProcessingOptions[0]);
    }
  }, [currentFile]);

  const processingOptionsForDropdown = availableProcessingOptions.map(
    (option) => {
      let label = "";
      switch (option) {
        case "ocr":
          label = "OCR";
          break;
        case "image_description":
          label = "Análisis de Imagen";
          break;
        case "llm":
          label = "Analizar con LLM";
          break;
        default:
          label = option;
      }
      return { label, value: option };
    }
  );

  const getModelOptions = () => {
    if (selectedProcessingOption === "image_description") {
      return llmModelOptions.filter(
        (model) =>
          model.label.toLowerCase().includes("vision") ||
          model.label.toLowerCase().includes("llava") ||
          model.label.toLowerCase().includes("gemm")
      );
    } else if (selectedProcessingOption === "ocr") {
      return llmModelOptions.filter(
        (model) =>
          model.label.toLowerCase().includes("deep") ||
          model.label.toLowerCase().includes("lla") ||
          model.label.toLowerCase().includes("gemm") ||
          model.label.toLowerCase().includes("qwq")
      );
    }
    return llmModelOptions;
  };
  const fieldLabels: Record<string, string> = {
    author: "Autor",
    title: "Título",
    content: "Contenido",
    tags: "Tags",
    sentiment: "Sentimiento",
    description: "Descripción",
    topics: "Temas",
    style: "Estilo",
    color_palette: "Paleta de Colores",
    composition: "Composición",
  };
  const handleSelect = (value: string) => {
    setSelectedProcessingOption(value);
    updateMetadata({ processingMethod: value });
  };
  const currentModelOptions = getModelOptions();
  useEffect(() => {
    console.log(selectedProcessingOption);
    switch (selectedProcessingOption) {
      case "ocr":
        setRenderFields(["author", "title", "content", "tags", "sentiment"]);
        break;
      case "image_description":
        setRenderFields([
          "description",
          "tags",
          "topics",
          "style",
          "color_palette",
          "composition",
        ]);
        break;
      default:
        setRenderFields(["author", "title", "content", "tags", "sentiment"]);
        break;
    }
  }, [selectedProcessingOption]);
  useEffect(() => {
    const options = getModelOptions();
    if (
      options.length > 0 &&
      !options.some((option) => option.value === llmConfig.model)
    ) {
      setLlmConfig({ ...llmConfig, model: options[0].value });
    }
  }, [selectedProcessingOption]);

  const handleProcessClick = () => {
    switch (selectedProcessingOption) {
      case "ocr":
        processWithOCR();
        break;
      case "image_description":
      case "llm":
        processWithLLM();
        break;
      case "manual":
        break;
    }
  };
  return (
    <div className="border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold mb-2">Opciones de procesamiento</h3>
      <div className="space-y-3">
        <div className="mb-4">
          <label className="font-bold block mb-2">Tipo de procesamiento:</label>
          <BrutalDropDown
            buttonLabel={
              processingOptionsForDropdown.find(
                (option) => option.value === selectedProcessingOption
              )?.label || "Seleccionar"
            }
            options={processingOptionsForDropdown}
            onSelect={(value) => {
              handleSelect(value);
            }}
          />
        </div>

        <BrutalButton
          onClick={handleProcessClick}
          disabled={isProcessing || !selectedProcessingOption}
          variant={selectedProcessingOption === "ocr" ? "blue" : "purple"}
          className="w-full"
        >
          {isProcessing
            ? "Procesando..."
            : `Procesar con ${
                processingOptionsForDropdown.find(
                  (option) => option.value === selectedProcessingOption
                )?.label || ""
              }`}
        </BrutalButton>

        <div className="mt-4 p-3 border-2 border-black rounded-lg bg-yellow-100">
          <h4 className="font-bold">Campos a extraer automáticamente:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {renderFields.map((field) => {
              return (
                <CustomCheckbox
                  key={field}
                  defaultChecked={autoFields[field]}
                  onChange={() => toggleAutoField(field)}
                  label={fieldLabels[field] || field}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-3 border-2 border-black rounded-lg bg-yellow-100">
          <h4 className="font-bold">Configuración del LLM:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <div>
              <label className="font-bold">Modelo</label>
              <BrutalDropDown
                buttonLabel={llmConfig.model}
                options={
                  currentModelOptions.length > 0
                    ? currentModelOptions
                    : llmModelOptions
                }
                onSelect={(value) =>
                  setLlmConfig({ ...llmConfig, model: value })
                }
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
                setLlmConfig({
                  ...llmConfig,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border-4 border-black rounded-lg"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
