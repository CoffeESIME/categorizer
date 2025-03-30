"use client";

import React, { useState, useEffect } from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import BrutalButton from "../ButtonComponent/ButtonComponent";
import BrutalDropDown from "../DropDownComponent/DropdownComponent";
import { ProcessingMethod } from "../../utils/categorizerAPI";

interface AutoFields {
  [key: string]: boolean;
  author: boolean;
  title: boolean;
  content: boolean;
  tags: boolean;
  sentiment: boolean;
  description: boolean;
  topics: boolean;
  style: boolean;
  color_palette: boolean;
  composition: boolean;
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
  onProcessingMethodChange: (method: ProcessingMethod) => void;
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
  onProcessingMethodChange,
}) => {
  if (!currentFile) return null;
  const availableProcessingOptions = getProcessingOptions(currentFile);
  const [selectedProcessingOption, setSelectedProcessingOption] =
    useState<string>("");
  const [renderFields, setRenderFields] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] =
    useState<ProcessingMethod>("manual");

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

  const handleMethodChange = (method: ProcessingMethod) => {
    setSelectedMethod(method);
    onProcessingMethodChange(method);
  };

  return (
    <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold">Opciones de Procesamiento</h3>
      <div className="space-y-2">
        <label className="font-bold">Método de Procesamiento:</label>
        <div className="flex flex-wrap gap-2">
          {getProcessingOptions(currentFile).map((option) => (
            <button
              key={option}
              onClick={() => handleMethodChange(option as ProcessingMethod)}
              className={`px-4 py-2 border-4 rounded-lg ${
                selectedMethod === option
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {option === "ocr"
                ? "OCR"
                : option === "image_description"
                ? "Descripción de Imagen"
                : option === "llm"
                ? "LLM"
                : "Manual"}
            </button>
          ))}
        </div>
      </div>

      {selectedMethod !== "manual" && (
        <>
          <div className="space-y-2">
            <label className="font-bold">Modelo LLM:</label>
            <BrutalDropDown
              options={llmModelOptions}
              buttonLabel={llmConfig.model}
              onSelect={(value: string) =>
                setLlmConfig({ ...llmConfig, model: value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold">Temperatura:</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={llmConfig.temperature}
                onChange={(e) =>
                  setLlmConfig({
                    ...llmConfig,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="min-w-[3rem] text-right">
                {llmConfig.temperature.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold">Campos Automáticos:</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(autoFields).map(([field, value]) => (
                <CustomCheckbox
                  key={field}
                  label={field}
                  checked={value}
                  onChange={() => toggleAutoField(field)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedMethod === "ocr" && (
              <BrutalButton
                onClick={processWithOCR}
                disabled={isProcessing}
                variant="blue"
              >
                {isProcessing ? "Procesando..." : "Procesar con OCR"}
              </BrutalButton>
            )}
            {(selectedMethod === "llm" ||
              selectedMethod === "image_description") && (
              <BrutalButton
                onClick={processWithLLM}
                disabled={isProcessing}
                variant="blue"
              >
                {isProcessing ? "Procesando..." : "Procesar con LLM"}
              </BrutalButton>
            )}
          </div>
        </>
      )}
    </div>
  );
};
