"use client";

import React, { useState, useEffect } from "react";
import CustomCheckbox from "../CheckBoxComponent/CheckBoxComponent"; //
import BrutalButton from "../ButtonComponent/ButtonComponent"; //
import BrutalDropDown from "../DropDownComponent/DropdownComponent"; //
import { BrutalInput } from "../InputComponent/InputComponent";
import { ProcessingMethod, TaskType } from "../../utils/categorizerAPI"; //
import { useTranslation } from "react-i18next";
import { Model as ConfigModel } from "../../store/configStore"; // For typing llmModelOptions
import { LlmConfig } from "../../types/llmConfig";

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
  frame_descriptions: boolean;
  composition: boolean;
}

interface ProcessOptionsProps {
  currentFile: any;
  isProcessing: boolean;
  processWithOCR: () => void;
  processWithLLM: (taskType?: TaskType) => void;
  autoFields: AutoFields;
  toggleAutoField: (field: string) => void;
  llmConfig: LlmConfig;
  setLlmConfig: React.Dispatch<React.SetStateAction<LlmConfig>>;
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
      case "audio":
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
      case "video":
        setRenderFields([
          "description",
          "topics",
          "style",
          "color_palette",
          "frame_descriptions",
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

  const visionModels = React.useMemo(
    () =>
      llmModelOptions.filter(
        (m) => m.groupName === "Vision / Multimodal Models"
      ),
    [llmModelOptions]
  );
  const textModels = React.useMemo(
    () =>
      llmModelOptions.filter(
        (m) =>
          m.groupName === "Text Generation Models" ||
          m.groupName === "General Purpose/Text Processing" ||
          m.groupName === "Text Analysis/Security"
      ),
    [llmModelOptions]
  );

  useEffect(() => {
    if (activeProcessingMethod === "image_description") {
      if (
        !visionModels.some((m) => m.value === llmConfig.model) &&
        visionModels[0]
      ) {
        setLlmConfig((prev) => ({ ...prev, model: visionModels[0].value }));
      }
    } else if (activeProcessingMethod === "video") {
      if (
        !visionModels.some((m) => m.value === llmConfig.model) &&
        visionModels[0]
      ) {
        setLlmConfig((prev) => ({ ...prev, model: visionModels[0].value }));
      }
      if (
        !textModels.some((m) => m.value === llmConfig.analysis_model) &&
        textModels[0]
      ) {
        setLlmConfig((prev) => ({
          ...prev,
          analysis_model: textModels[0].value,
        }));
      }
    } else if (
      activeProcessingMethod === "ocr" ||
      activeProcessingMethod === "llm" ||
      activeProcessingMethod === "audio"
    ) {
      if (
        !textModels.some((m) => m.value === llmConfig.model) &&
        textModels[0]
      ) {
        setLlmConfig((prev) => ({ ...prev, model: textModels[0].value }));
      }
    }
  }, [
    activeProcessingMethod,
    visionModels,
    textModels,
    llmConfig,
    setLlmConfig,
    currentFile,
  ]);

  const currentFilteredModels =
    activeProcessingMethod === "image_description" ? visionModels : textModels;

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
                : option === "audio"
                ? t("processOptions.audio")
                : option === "video"
                ? t("processOptions.video")
                : option === "llm"
                ? t("processOptions.llm")
                : t("processOptions.manual")}
            </button>
          ))}
        </div>
      </div>

      {activeProcessingMethod !== "manual" && (
        <>
          {activeProcessingMethod === "video" ? (
            <>
              <div className="space-y-2">
                <label className="font-bold">
                  {t("processOptions.model")}:
                </label>
                <BrutalDropDown
                  options={visionModels.map((m) => ({
                    label: m.label,
                    value: m.value,
                  }))}
                  buttonLabel={
                    visionModels.find((m) => m.value === llmConfig.model)
                      ?.label ||
                    llmConfig.model ||
                    t("processOptions.model")
                  }
                  onSelect={(value: string) =>
                    setLlmConfig((prev) => ({ ...prev, model: value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold">
                  {t("processOptions.visionTemperature")}:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={llmConfig.vision_temperature ?? 0}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({
                        ...prev,
                        vision_temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="min-w-[3rem] text-right">
                    {(llmConfig.vision_temperature ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-bold">
                  {t("processOptions.analysisModel")}:
                </label>
                <BrutalDropDown
                  options={textModels.map((m) => ({
                    label: m.label,
                    value: m.value,
                  }))}
                  buttonLabel={
                    textModels.find((m) => m.value === llmConfig.analysis_model)
                      ?.label ||
                    llmConfig.analysis_model ||
                    t("processOptions.analysisModel")
                  }
                  onSelect={(value: string) =>
                    setLlmConfig((prev) => ({ ...prev, analysis_model: value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold">
                  {t("processOptions.analysisTemperature")}:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={llmConfig.temperature}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="min-w-[3rem] text-right">
                    {llmConfig.temperature.toFixed(1)}
                  </span>
                </div>
              </div>
              <BrutalInput
                label={t("processOptions.prompt")}
                value={llmConfig.prompt || ""}
                onChange={(e) =>
                  setLlmConfig((prev) => ({ ...prev, prompt: e.target.value }))
                }
              />
              <BrutalInput
                label={t("processOptions.context")}
                multiline
                value={llmConfig.context || ""}
                onChange={(e) =>
                  setLlmConfig((prev) => ({ ...prev, context: e.target.value }))
                }
              />
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="font-bold">
                  {t("processOptions.model")}:
                </label>
                <BrutalDropDown
                  options={currentFilteredModels.map((m) => ({
                    label: m.label,
                    value: m.value,
                  }))}
                  buttonLabel={
                    currentFilteredModels.find(
                      (m) => m.value === llmConfig.model
                    )?.label ||
                    llmConfig.model ||
                    t("processOptions.model")
                  }
                  onSelect={(value: string) =>
                    setLlmConfig((prev) => ({ ...prev, model: value }))
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
                      setLlmConfig((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="min-w-[3rem] text-right">
                    {llmConfig.temperature.toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          )}
          {renderFields.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold">
                {t("processOptions.autoFields")}:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {autoFields &&
                  renderFields.map((field) => {
                    const isChecked = autoFields[field] ?? true;
                    return (
                      <CustomCheckbox
                        key={field}
                        label={t(`metadataForm.fields.${field}`, field)}
                        checked={isChecked}
                        onChange={() => toggleAutoField(field)}
                      />
                    );
                  })}
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
              activeProcessingMethod === "image_description" ||
              activeProcessingMethod === "audio" ||
              activeProcessingMethod === "video") && (
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
