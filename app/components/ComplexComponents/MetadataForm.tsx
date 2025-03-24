"use client";
import React from "react";
import { BrutalInput } from "../InputComponent/InputComponent";
import BrutalButton from "../ButtonComponent/ButtonComponent";

interface MetadataFormProps {
  metadata: any;
  updateMetadata: (updates: Partial<any>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  metadata,
  updateMetadata,
  addTag,
  removeTag,
}) => {
  if (!metadata) return null;
  const renderTagSection = (
    tags: string[],
    addHandler: (tag: string) => void,
    removeHandler: (tag: string) => void
  ) => (
    <div>
      <div className="flex space-x-2">
        <BrutalInput
          type="text"
          id="tagInput"
          placeholder="Agregar tag"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addHandler((e.target as HTMLInputElement).value);
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
            addHandler(input.value);
            input.value = "";
          }}
          variant="teal"
        >
          +
        </BrutalButton>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags?.map((tag: string) => (
          <span
            key={tag}
            className="bg-blue-200 border-2 border-black px-2 py-1 rounded-lg flex items-center"
          >
            {tag}
            <button
              onClick={() => removeHandler(tag)}
              className="ml-2 text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  if (
    metadata.processingMethod === "ocr" ||
    (metadata.file_type === "image" &&
      metadata.processingMethod !== "image_description")
  ) {
    return (
      <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
        <h3 className="text-xl font-bold">Metadatos OCR</h3>
        <div>
          <label className="font-bold">Título</label>
          <BrutalInput
            type="text"
            placeholder="Título del contenido"
            value={metadata.title || ""}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Autor</label>
          <BrutalInput
            type="text"
            placeholder="Autor del contenido"
            value={metadata.author || ""}
            onChange={(e) => updateMetadata({ author: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Tags</label>
          {renderTagSection(metadata.tags || [], addTag, removeTag)}
        </div>

        <div>
          <label className="font-bold">Obra/Fuente (work)</label>
          <BrutalInput
            type="text"
            placeholder="Obra o fuente"
            value={metadata.work || ""}
            onChange={(e) => updateMetadata({ work: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>

        <div>
          <label className="font-bold">Idiomas (languages)</label>
          <BrutalInput
            type="text"
            placeholder="Ej: es, en"
            value={(metadata.languages || []).join(", ")}
            onChange={(e) =>
              updateMetadata({ languages: e.target.value.split(",") })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Sentiment Word</label>
          <BrutalInput
            type="text"
            placeholder="Ej: positivo, negativo"
            value={metadata.sentiment_word || ""}
            onChange={(e) => updateMetadata({ sentiment_word: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>

        <div>
          <label className="font-bold">Sentiment Value (entre -1 y 1)</label>
          <BrutalInput
            type="number"
            step="0.1"
            min={-1}
            max={1}
            value={metadata.sentiment_value || 0}
            onChange={(e) =>
              updateMetadata({ sentiment_value: parseFloat(e.target.value) })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Analysis</label>
          <BrutalInput
            type="textarea"
            placeholder="Análisis profundo del contenido"
            value={metadata.analysis || ""}
            onChange={(e) => updateMetadata({ analysis: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg h-32"
            multiline
          />
        </div>
        <div>
          <label className="font-bold">Categorías</label>
          <BrutalInput
            type="text"
            placeholder="Categorías separadas por coma"
            value={(metadata.categories || []).join(", ")}
            onChange={(e) =>
              updateMetadata({
                categories: e.target.value.split(",").map((c) => c.trim()),
              })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Keywords</label>
          <BrutalInput
            type="text"
            placeholder="Palabras clave separadas por coma"
            value={(metadata.keywords || []).join(", ")}
            onChange={(e) =>
              updateMetadata({
                keywords: e.target.value.split(",").map((k) => k.trim()),
              })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Tipo de contenido (content_type)</label>
          <BrutalInput
            type="text"
            placeholder="Ej: cita, artículo..."
            value={metadata.content_type || ""}
            onChange={(e) => updateMetadata({ content_type: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">¿Multilingüe?</label>
          <input
            type="checkbox"
            checked={metadata.multilingual || false}
            onChange={(e) => updateMetadata({ multilingual: e.target.checked })}
            className="ml-2"
          />
        </div>
        {!metadata.multilingual && (
          <div>
            <label className="font-bold">Contenido limpio (contentt)</label>
            <BrutalInput
              type="textarea"
              placeholder="Texto extraído limpio"
              value={metadata.content || ""}
              onChange={(e) => updateMetadata({ content: e.target.value })}
              className="w-full p-2 border-4 border-black rounded-lg h-32"
              multiline
            />
          </div>
        )}
      </div>
    );
  }

  if (metadata.processingMethod === "image_description") {
    return (
      <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
        <h3 className="text-xl font-bold">Metadatos - Análisis de Imagen</h3>
        <div>
          <label className="font-bold">Descripción (description)</label>
          <BrutalInput
            type="textarea"
            placeholder="Descripción detallada de la imagen"
            value={metadata.description || ""}
            onChange={(e) => updateMetadata({ description: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg h-32"
            multiline
          />
        </div>{" "}
        <div>
          <label className="font-bold">Tags</label>
          {renderTagSection(metadata.tags || [], addTag, removeTag)}
        </div>
        <div>
          <label className="font-bold">Temas (topics)</label>
          <BrutalInput
            type="text"
            placeholder="Temas separados por coma"
            value={(metadata.topics || []).join(", ")}
            onChange={(e) =>
              updateMetadata({
                topics: e.target.value.split(",").map((t) => t.trim()),
              })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Estilo (style)</label>
          <BrutalInput
            type="text"
            placeholder="Descripción del estilo visual"
            value={metadata.style || ""}
            onChange={(e) => updateMetadata({ style: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg h-32"
          />
        </div>
        <div>
          <label className="font-bold">Color Palette</label>
          <BrutalInput
            type="text"
            placeholder="Colores separados por coma (opcional)"
            value={(metadata.color_palette || []).join(", ")}
            onChange={(e) =>
              updateMetadata({
                color_palette: e.target.value.split(",").map((c) => c.trim()),
              })
            }
            className="w-full p-2 border-4 border-black rounded-lg"
          />
        </div>
        <div>
          <label className="font-bold">Composición (composition)</label>
          <BrutalInput
            type="textarea"
            placeholder="Notas sobre la composición de la imagen"
            value={metadata.composition || ""}
            onChange={(e) => updateMetadata({ composition: e.target.value })}
            className="w-full p-2 border-4 border-black rounded-lg h-32"
            multiline
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
      <h3 className="text-xl font-bold">Metadatos Generales / Manual</h3>
      <div>
        <label className="font-bold">Autor</label>
        <BrutalInput
          type="text"
          placeholder="Autor del contenido"
          value={metadata.author || ""}
          onChange={(e) => updateMetadata({ author: e.target.value })}
          className="w-full p-2 border-4 border-black rounded-lg"
        />
      </div>

      <div>
        <label className="font-bold">Título</label>
        <BrutalInput
          type="text"
          placeholder="Título del contenido"
          value={metadata.title || ""}
          onChange={(e) => updateMetadata({ title: e.target.value })}
          className="w-full p-2 border-4 border-black rounded-lg"
        />
      </div>
      <div>
        <label className="font-bold">Tags</label>
        {renderTagSection(metadata.tags || [], addTag, removeTag)}
      </div>

      <div>
        <label className="font-bold">Contenido</label>
        <BrutalInput
          type="textarea"
          placeholder="Contenido del archivo"
          value={metadata.content || ""}
          onChange={(e) => updateMetadata({ content: e.target.value })}
          className="w-full p-2 border-4 border-black rounded-lg h-32"
          multiline
        />
      </div>

      <div>
        <label className="font-bold">Sentiment Word</label>
        <BrutalInput
          type="text"
          placeholder="Ej: positivo, negativo"
          value={metadata.sentiment_word || ""}
          onChange={(e) => updateMetadata({ sentiment_word: e.target.value })}
          className="w-full p-2 border-4 border-black rounded-lg"
        />
      </div>

      <div>
        <label className="font-bold">Sentiment Value (entre -1 y 1)</label>
        <BrutalInput
          type="number"
          step="0.1"
          min={-1}
          max={1}
          value={metadata.sentiment_value || 0}
          onChange={(e) =>
            updateMetadata({ sentiment_value: parseFloat(e.target.value) })
          }
          className="w-full p-2 border-4 border-black rounded-lg"
        />
      </div>
      <div>
        <label className="font-bold">Analysis</label>
        <BrutalInput
          type="textarea"
          placeholder="Análisis profundo del contenido"
          value={metadata.analysis || ""}
          onChange={(e) => updateMetadata({ analysis: e.target.value })}
          className="w-full p-2 border-4 border-black rounded-lg h-32"
          multiline
        />
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
  );
};
