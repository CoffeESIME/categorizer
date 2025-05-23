"use client";

import React, { useState, useEffect } from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent"; //
import BrutalButton from "../ButtonComponent/ButtonComponent"; //
import BrutalDropDown from "../DropDownComponent/DropdownComponent"; //
import { ProcessingMethod, TaskType } from "../../utils/categorizerAPI"; //
import { useTranslation } from "react-i18next";
import { Model as ConfigModel } from "../../store/configStore"; // For typing llmModelOptions

interface AutoFields {
  //
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
  processWithLLM: (taskType?: TaskType) => void;
  autoFields: AutoFields;
  toggleAutoField: (field: string) => void;
  llmConfig: {
    model: string;
    temperature: number;
  };
  setLlmConfig: (config: { model: string; temperature: number }) => void;
  llmModelOptions: (ConfigModel & { groupName?: string })[]; // Expect groupName for filtering
  getProcessingOptions: (file: any) => ProcessingMethod[];
  activeProcessingMethod: ProcessingMethod;
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
  activeProcessingMethod,
  onProcessingMethodChange,
}) => {
  const { t } = useTranslation();
  const [renderFields, setRenderFields] = useState<string[]>([]);

  const availableMethodsForFile = currentFile
    ? getProcessingOptions(currentFile)
    : [];

  useEffect(() => {
    switch (activeProcessingMethod) {
      case "ocr":
        setRenderFields([
          "author",
          "title",
          "content",
          "tags",
          "sentiment",
          "work",
          "languages",
          "analysis",
          "categories",
          "keywords",
          "content_type",
          "multilingual",
          "extractedText",
        ]);
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
      case "llm":
        setRenderFields([
          "author",
          "title",
          "content",
          "tags",
          "sentiment",
          "work",
          "languages",
          "analysis",
          "categories",
          "keywords",
          "content_type",
          "multilingual",
        ]);
        break;
      default:
        setRenderFields([]);
        break;
    }
  }, [activeProcessingMethod]);

  const getFilteredModelOptions = React.useCallback(() => {
    if (activeProcessingMethod === "image_description") {
      return llmModelOptions.filter(
        (model) => model.groupName === "Vision Models"
      );
    } else if (
      activeProcessingMethod === "ocr" ||
      activeProcessingMethod === "llm"
    ) {
      return llmModelOptions.filter(
        (model) =>
          model.groupName === "Text Generation Models" ||
          model.groupName === "General Purpose/Text Processing" ||
          model.groupName === "Text Analysis/Security"
      );
    }
    // Default or fallback if no specific method matches complex filtering needs
    return llmModelOptions.filter(
      (model) =>
        model.groupName === "Text Generation Models" ||
        model.groupName === "General Purpose/Text Processing"
    );
  }, [activeProcessingMethod, llmModelOptions]);

  const currentFilteredModels = getFilteredModelOptions();

  useEffect(() => {
    const filteredModels = getFilteredModelOptions();
    if (filteredModels.length > 0) {
      const isCurrentModelValid = filteredModels.some(
        (option) => option.value === llmConfig.model
      );
      if (!isCurrentModelValid) {
        setLlmConfig({ ...llmConfig, model: filteredModels[0].value });
      }
    } else if (llmConfig.model && activeProcessingMethod !== "manual") {
      // If no models are valid for the current auto-processing type,
      // it might be good to clear the model or set a placeholder,
      // or inform the user. For now, we'll ensure it doesn't crash.
      // setLlmConfig({ ...llmConfig, model: "" }); // Or a specific placeholder/error state
    }
  }, [
    activeProcessingMethod,
    currentFile,
    llmConfig,
    setLlmConfig,
    getFilteredModelOptions,
  ]);

  if (!currentFile) return null;

  const methodButtonClass = (method: ProcessingMethod) =>
    `px-4 py-2 border-4 rounded-lg ${
      activeProcessingMethod === method
        ? "border-blue-500 bg-blue-100"
        : "border-gray-300 hover:bg-gray-100"
    }`;

  return (
    <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold">{t("processOptions.title")}</h3>
      <div className="space-y-2">
        <label className="font-bold">{t("processOptions.method")}:</label>
        <div className="flex flex-wrap gap-2">
          {availableMethodsForFile.map((option) => (
            <button
              key={option}
              onClick={() =>
                onProcessingMethodChange(option as ProcessingMethod)
              }
              className={methodButtonClass(option as ProcessingMethod)}
            >
              {option === "ocr"
                ? t("processOptions.ocr")
                : option === "image_description"
                ? t("processOptions.imageDescription")
                : option === "llm"
                ? t("processOptions.llm")
                : t("processOptions.manual")}
            </button>
          ))}
        </div>
      </div>

      {activeProcessingMethod !== "manual" && (
        <>
          <div className="space-y-2">
            <label className="font-bold">{t("processOptions.model")}:</label>
            <BrutalDropDown
              options={currentFilteredModels.map((m) => ({
                label: m.label,
                value: m.value,
              }))}
              buttonLabel={
                currentFilteredModels.find((m) => m.value === llmConfig.model)
                  ?.label ||
                llmConfig.model ||
                t("processOptions.model")
              }
              onSelect={(value: string) =>
                setLlmConfig({ ...llmConfig, model: value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold">
              {t("processOptions.temperature")}:
            </label>
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
          {renderFields.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold">
                {t("processOptions.autoFields")}:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {renderFields.map((field) => (
                  <CustomCheckbox
                    key={field}
                    label={t(`metadataForm.fields.${field}`, field)}
                    checked={autoFields[field]}
                    onChange={() => toggleAutoField(field)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {activeProcessingMethod === "ocr" && (
              <BrutalButton
                onClick={processWithOCR}
                disabled={isProcessing}
                variant="blue"
              >
                {isProcessing
                  ? t("general.loading")
                  : t("processOptions.processWithOCR")}
              </BrutalButton>
            )}
            {(activeProcessingMethod === "llm" ||
              activeProcessingMethod === "image_description") && (
              <BrutalButton
                onClick={() =>
                  processWithLLM(activeProcessingMethod as TaskType)
                }
                disabled={isProcessing}
                variant="blue"
              >
                {isProcessing
                  ? t("general.loading")
                  : t("processOptions.processWithLLM")}
              </BrutalButton>
            )}
          </div>
        </>
      )}
    </div>
  );
};
