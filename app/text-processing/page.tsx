"use client";
import React, { useState, useEffect } from "react";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { BrutalButton } from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import BrutalDropDown from "../components/DropDownComponent/DropdownComponent";
import CustomCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import Link from "next/link";

// Puedes usar el mismo MetadataForm que mostraste, renombrado a TextMetadataForm
import { MetadataForm } from "../components/ComplexComponents/MetadataForm";

import categorizerAPI, { ProcessingMethod } from "../utils/categorizerAPI";
import { useConfigStore } from "../store/configStore";

/**
 * Estructura de metadatos para cada texto.
 * Se parece a FileMetadata pero adaptado a texto.
 */
export type TextMetadata = {
  id: string;
  text: string; // contenido principal
  author?: string;
  title?: string;
  tags: string[];
  work?: string;
  sentiment_word?: string;
  sentiment_value?: number;
  analysis?: string;
  categories?: string[];
  keywords?: string[];
  content_type?: string;
  multilingual?: boolean;
  content?: string;
  topics?: string[];
  style?: string;
  color_palette?: string[];
  composition?: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  processingMethod?: ProcessingMethod;
  llmErrorResponse?: string;
};

/**
 * Campos que rellenaremos automáticamente al procesar vía LLM
 */
interface AutoFields {
  author: boolean;
  title: boolean;
  tags: boolean;
  sentiment: boolean;
  content: boolean;
  analysis: boolean;
  work: boolean;
  multilingual: boolean;
  sentiment_word: boolean;
  sentiment_value: boolean;
  languages: boolean;
  description: boolean;
  topics: boolean;
  style: boolean;
  color_palette: boolean;
  frame_descriptions: boolean;
  composition: boolean;
}

/**
 * Subcomponente para listar todos los textos
 */
const TextList: React.FC<{
  texts: TextMetadata[];
  currentTextId: string | null;
  setCurrentTextId: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ texts, currentTextId, setCurrentTextId }) => {
  if (texts.length === 0) {
    return <p className="text-gray-600">No hay textos agregados.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {texts.map((t) => (
        <button
          key={t.id}
          onClick={() => setCurrentTextId(t.id)}
          className={`p-2 border-4 text-left ${
            currentTextId === t.id
              ? "bg-yellow-200 border-black"
              : "bg-white border-gray-300"
          } rounded-lg shadow-brutal`}
        >
          <div className="font-bold">Texto #{t.id}</div>
          <div className="text-sm text-gray-600 line-clamp-2">{t.text}</div>
          <div className="text-xs mt-1">
            Status: <strong>{t.processingStatus}</strong>
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * Subcomponente para la vista previa de un texto
 */
const TextPreview: React.FC<{ textItem: TextMetadata | null }> = ({
  textItem,
}) => {
  if (!textItem) return <div>Selecciona un texto para ver</div>;

  return (
    <div className="p-4 border-4 border-black rounded-lg bg-white shadow-brutal">
      <h3 className="text-lg font-bold mb-2">Vista previa</h3>
      <p>{textItem.text}</p>
    </div>
  );
};

/**
 * Subcomponente "TextProcessOptions"
 * Similar a "ProcessOptions" en tu componente de archivos:
 * - Muestra selección de modelo
 * - Temperatura
 * - Checkboxes de autocompletado
 * - Botón para procesar con LLM
 */
interface TextProcessOptionsProps {
  isProcessing: boolean;
  processWithLLM: () => Promise<void>;
  autoFields: AutoFields;
  toggleAutoField: (field: keyof AutoFields) => void;
  llmConfig: { model: any; temperature: number };
  setLlmConfig: React.Dispatch<
    React.SetStateAction<{ model: any; temperature: number }>
  >;
  llmModelOptions: any[]; // Si tu store devuelve strings, usa string[]
}

const TextProcessOptions: React.FC<TextProcessOptionsProps> = ({
  isProcessing,
  processWithLLM,
  autoFields,
  toggleAutoField,
  llmConfig,
  setLlmConfig,
  llmModelOptions,
}) => {
  // Convertir los modelos a formato para BrutalDropDown
  const modelOptions = llmModelOptions.map((m) => ({
    label: typeof m === "object" ? m.label || m.value : m,
    value: typeof m === "object" ? m.value : m,
  }));

  const selectedModelLabel =
    typeof llmConfig.model === "object"
      ? llmConfig.model.label || llmConfig.model.value
      : llmConfig.model;

  return (
    <div className="p-4 border-4 border-black rounded-lg bg-white shadow-brutal space-y-4">
      <h3 className="text-lg font-bold">Opciones de Procesamiento</h3>

      {/* Selección de modelo */}
      <div>
        <label className="block font-bold mb-1">Modelo LLM:</label>
        <BrutalDropDown
          buttonLabel={selectedModelLabel}
          options={modelOptions}
          onSelect={(value: string) =>
            setLlmConfig((prev) => ({ ...prev, model: { value } }))
          }
        />
      </div>

      {/* Temperatura */}
      <div>
        <label className="block font-bold mb-1">
          Temperatura: {llmConfig.temperature}
        </label>
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
          className="w-full border-2 border-black"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>Preciso</span>
          <span>Creativo</span>
        </div>
      </div>

      {/* Checkboxes de autoFields */}
      <div className="border-4 border-black p-3 rounded-lg space-y-2">
        <label className="block font-bold">Campos automáticos:</label>
        {Object.keys(autoFields).map((field) => (
          <div key={field} className="flex items-center space-x-2">
            <CustomCheckbox
              id={`auto-${field}`}
              defaultChecked={autoFields[field as keyof AutoFields]}
              onChange={() => toggleAutoField(field as keyof AutoFields)}
            />
            <label htmlFor={`auto-${field}`} className="text-sm">
              {field}
            </label>
          </div>
        ))}
      </div>

      <BrutalButton
        onClick={processWithLLM}
        disabled={isProcessing}
        variant="blue"
        className="w-full"
      >
        {isProcessing ? "Procesando..." : "Procesar con LLM"}
      </BrutalButton>
    </div>
  );
};

/**
 * Página principal "ProcessTexts"
 */
export default function ProcessTexts() {
  // Aquí puedes usar un input para que el usuario agregue texto
  // y lo agregue a la lista a procesar
  const [newTextInput, setNewTextInput] = useState("");

  // Estado de la lista de textos
  const [texts, setTexts] = useState<TextMetadata[]>([]);

  // Mapeo ID -> metadatos
  const [textMetadata, setTextMetadata] = useState<
    Record<string, TextMetadata>
  >({});

  // ID del texto seleccionado
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  // Campos automáticos
  const [autoFields, setAutoFields] = useState<AutoFields>({
    author: true,
    title: true,
    tags: true,
    sentiment: true,
    content: true,
    analysis: true,
    work: true,
    multilingual: true,
    languages: true,
    sentiment_word: true,
    sentiment_value: true,
    description: true,
    topics: true,
    style: true,
    color_palette: true,
    frame_descriptions: true,
    composition: true,
  });

  // Config LLM (modelo, temperatura)
  const { getModelsByGroup } = useConfigStore();
  // Si getModelsByGroup devuelven un array de strings
  const llmModelOptions = [
    ...getModelsByGroup("Text Generation Models"),
    ...getModelsByGroup("Vision Models"),
  ];

  const [llmConfig, setLlmConfig] = useState({
    model: llmModelOptions?.[0] || "deepseek-r1:14b",
    temperature: 0.7,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Genera un ID simple para cada texto
   */
  const generateId = () => Math.random().toString(36).substring(2);

  /**
   * Función para agregar un nuevo texto a la lista
   */
  const handleAddText = () => {
    if (!newTextInput.trim()) return;

    const id = generateId();
    const newMetadata: TextMetadata = {
      id,
      text: newTextInput.trim(),
      tags: [],
      processingStatus: "pending",
    };

    setTexts((prev) => [...prev, newMetadata]);
    setTextMetadata((prev) => ({
      ...prev,
      [id]: newMetadata,
    }));
    setNewTextInput("");

    // Seleccionar inmediatamente el último texto añadido
    setCurrentTextId(id);
  };

  /**
   * Retorna el texto seleccionado
   */
  const getCurrentText = () => {
    return currentTextId ? textMetadata[currentTextId] : null;
  };

  /**
   * Actualiza el metadato del texto actual
   */
  const updateCurrentTextMetadata = (updates: Partial<TextMetadata>) => {
    if (!currentTextId) return;
    setTextMetadata((prev) => ({
      ...prev,
      [currentTextId]: {
        ...prev[currentTextId],
        ...updates,
      },
    }));
  };

  /**
   * Helpers para fusionar valores (igual que en "ProcessFiles")
   */
  const mergeField = (
    existing: string | undefined,
    newValue: string | undefined
  ): string => {
    if (existing && newValue) {
      return `${existing} ${newValue}`.trim();
    }
    return newValue || existing || "";
  };

  const mergeArrayField = (
    existing: string[] | undefined,
    newValue: string[] | undefined
  ): string[] => {
    const existingArr = existing || [];
    const newArr = newValue || [];
    return Array.from(new Set([...existingArr, ...newArr]));
  };

  /**
   * Procesar el texto seleccionado con LLM
   */
  const processWithLLM = async () => {
    const current = getCurrentText();
    if (!current) return;

    updateCurrentTextMetadata({
      processingStatus: "processing",
      processingMethod: "manual",
      llmErrorResponse: "",
    });
    setIsProcessing(true);

    try {
      const result = await categorizerAPI.processTextLLM({
        input_text: current.text,
        model:
          typeof llmConfig.model === "object"
            ? llmConfig.model.value
            : llmConfig.model,
        temperature: llmConfig.temperature,
      });

      if (result?.error) {
        updateCurrentTextMetadata({
          processingStatus: "failed",
          llmErrorResponse: result.raw || result.raw_analysis || "",
        });
        alert("Ocurrió un error al procesar el texto con LLM.");
      } else {
        // Tomamos los campos devueltos por la IA
        // y los fusionamos condicionalmente si autoFields está activo
        const existingMetadata = getCurrentText();
        if (!existingMetadata) return; // en caso de race condition

        updateCurrentTextMetadata({
          content: autoFields.content
            ? mergeField(existingMetadata.text, result.content)
            : existingMetadata.text,
          author: autoFields.author
            ? mergeField(existingMetadata.author, result.author)
            : existingMetadata.author,
          title: autoFields.title
            ? mergeField(existingMetadata.title, result.title)
            : existingMetadata.title,
          tags: autoFields.tags
            ? mergeArrayField(existingMetadata.tags, result.tags)
            : existingMetadata.tags,
          sentiment_word: autoFields.sentiment
            ? mergeField(existingMetadata.sentiment_word, result.sentiment_word)
            : existingMetadata.sentiment_word,
          sentiment_value: autoFields.sentiment
            ? result.sentiment_value
            : existingMetadata.sentiment_value,
          analysis: autoFields.analysis
            ? mergeField(existingMetadata.analysis, result.analysis)
            : existingMetadata.analysis,
          work: autoFields.work
            ? mergeField(existingMetadata.work, result.work)
            : existingMetadata.work,
        });
      }
    } catch (error) {
      console.error("Error procesando texto con LLM:", error);
      updateCurrentTextMetadata({
        processingStatus: "failed",
        llmErrorResponse: String(error),
      });
      alert("Ocurrió un error al procesar el texto con LLM.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Guardar todos los metadatos
   */
  const saveAllMetadata = async () => {
    setIsProcessing(true);
    try {
      const allMetadata = Object.values(textMetadata);
      await categorizerAPI.saveTextMetadata(allMetadata);
      alert("¡Metadatos guardados exitosamente!");
    } catch (error) {
      console.error("Error al guardar metadatos:", error);
      alert("Error guardando metadatos. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Toggle para los autoFields
   */
  const toggleAutoField = (field: keyof AutoFields) => {
    setAutoFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * Añadir una etiqueta al texto actual
   */
  const addTag = (tag: string) => {
    if (!currentTextId || !tag.trim()) return;
    setTextMetadata((prev) => {
      const currentTags = prev[currentTextId].tags || [];
      if (!currentTags.includes(tag.trim())) {
        return {
          ...prev,
          [currentTextId]: {
            ...prev[currentTextId],
            tags: [...currentTags, tag.trim()],
          },
        };
      }
      return prev;
    });
  };

  /**
   * Quitar una etiqueta del texto actual
   */
  const removeTag = (tag: string) => {
    if (!currentTextId) return;
    setTextMetadata((prev) => {
      const currentTags = prev[currentTextId].tags || [];
      return {
        ...prev,
        [currentTextId]: {
          ...prev[currentTextId],
          tags: currentTags.filter((t) => t !== tag),
        },
      };
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col bg-yellow-100">
      <TitleComponent title="Procesar Textos" variant="neobrutalism" />

      <div className="max-w-6xl mx-auto w-full">
        <div className="p-4 border-4 border-black bg-white rounded-lg shadow-brutal">
          {/* SECCIÓN: Añadir texto */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Agregar nuevo texto</h2>
            <BrutalInput
              type="text"
              multiline={true}
              value={newTextInput}
              onChange={(e) => setNewTextInput(e.target.value)}
              placeholder="Escribe aquí el texto que desees procesar..."
              className="w-full mb-2 h-24"
            />
            <BrutalButton onClick={handleAddText} variant="green">
              Agregar a la lista
            </BrutalButton>
          </div>

          {/* SECCIÓN: Lista de textos */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">
              Selecciona un texto para procesar:
            </h3>
            <TextList
              texts={Object.values(textMetadata)}
              currentTextId={currentTextId}
              setCurrentTextId={setCurrentTextId}
            />
          </div>

          {/* SECCIÓN: Vista previa y opciones */}
          {currentTextId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna izquierda: Vista previa y opciones */}
              <div className="space-y-4">
                <TextPreview textItem={getCurrentText()} />
                <TextProcessOptions
                  isProcessing={isProcessing}
                  processWithLLM={processWithLLM}
                  autoFields={autoFields}
                  toggleAutoField={toggleAutoField}
                  llmConfig={llmConfig}
                  setLlmConfig={setLlmConfig}
                  llmModelOptions={llmModelOptions}
                />
              </div>

              {/* Columna derecha: Formulario de metadatos */}
              <MetadataForm
                metadata={getCurrentText()}
                updateMetadata={(updates) => updateCurrentTextMetadata(updates)}
                addTag={addTag}
                removeTag={removeTag}
              />
            </div>
          )}

          {/* SECCIÓN: Botones Finales */}
          <div className="mt-6 flex justify-between">
            <Link href="/">
              <BrutalButton variant="gray">Volver al Inicio</BrutalButton>
            </Link>
            <BrutalButton
              onClick={saveAllMetadata}
              disabled={isProcessing || texts.length === 0}
              variant="green"
            >
              {isProcessing ? "Guardando..." : "Guardar metadatos"}
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
