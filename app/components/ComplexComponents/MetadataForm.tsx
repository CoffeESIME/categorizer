// app/components/ComplexComponents/MetadataForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrutalInput } from "../InputComponent/InputComponent"; //
import BrutalButton from "../ButtonComponent/ButtonComponent"; //
import BrutalDropDown from "../DropDownComponent/DropdownComponent"; //

interface MetadataFormProps {
  metadata: any;
  updateMetadata: (updates: Partial<any>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  onDeleteFile?: () => void;
  onEmbeddingTypeChange?: (type: string) => void;
}

const embeddingTypeOptions = [
  { label: "Texto (por defecto)", value: "text" },
  { label: "PDF", value: "pdf" },
  { label: "Imagen (CLIP + Descripción)", value: "image_w_des" },
  { label: "Imagen (CLIP + OCR)", value: "ocr_w_img" },
  { label: "OCR (solo texto extraído)", value: "ocr" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
  { label: "Grafo", value: "graph" },
];

export const MetadataForm: React.FC<MetadataFormProps> = ({
  metadata,
  updateMetadata,
  addTag,
  removeTag,
  onDeleteFile,
  onEmbeddingTypeChange,
}) => {
  const { t } = useTranslation();
  const [showCombinedForm, setShowCombinedForm] = useState(false);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");

  if (!metadata) return null;

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInputValue.trim()) {
        addTag(tagInputValue.trim());
        setTagInputValue("");
      }
    }
  };

  const handleAddTagClick = () => {
    if (tagInputValue.trim()) {
      addTag(tagInputValue.trim());
      setTagInputValue("");
    }
  };

  const renderTagSection = (
    tags: string[],
    addHandler: (tag: string) => void, // Corrected: expecting addTag (which expects string)
    removeHandler: (tag: string) => void
  ) => (
    <div>
      <div className="flex space-x-2">
        <BrutalInput
          type="text"
          id="tagInput"
          placeholder={t("metadataForm.placeholders.tags")}
          value={tagInputValue}
          onChange={(e) => setTagInputValue(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          className="flex-1 p-2 border-4 border-black rounded-lg"
        />
        <BrutalButton
          onClick={handleAddTagClick} // Use the new handler
          variant="teal"
        >
          +
        </BrutalButton>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {/* ... (map tags - unchanged) ... */}
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

  const isImage = metadata?.file_type?.startsWith("image");

  // Determine current embedding type from metadata, applying defaults if not set
  // This default logic is now primarily handled by ProcessFiles,
  // but we can still have a fallback here for direct display.
  const currentEmbeddingType =
    metadata?.embedding_type ||
    (isImage
      ? "image_w_des"
      : metadata?.file_type === "application/pdf"
      ? "pdf"
      : "text");

  const selectedEmbeddingTypeLabel =
    embeddingTypeOptions.find((opt) => opt.value === currentEmbeddingType)
      ?.label || t("processOptions.method");

  return (
    <div className="space-y-4">
      {isImage && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setShowCombinedForm(!showCombinedForm)}
            className={`px-4 py-2 border-4 rounded-lg ${
              showCombinedForm
                ? "border-blue-500 bg-blue-100"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {showCombinedForm
              ? t("processing.useSimpleForm")
              : t("processing.useCombinedForm")}
          </button>
          <button
            onClick={() => setShowDeleteOption(!showDeleteOption)}
            className="px-4 py-2 border-4 border-red-500 rounded-lg hover:bg-red-100"
          >
            {showDeleteOption
              ? t("general.cancel")
              : t("processing.deleteFile")}
          </button>
        </div>
      )}

      {showDeleteOption && (
        <div className="p-4 border-4 border-red-500 rounded-lg bg-red-50">
          <p className="font-bold mb-2">{t("processing.deleteConfirm")}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteOption(false)}
              className="px-4 py-2 border-4 border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {t("general.cancel")}
            </button>
            <button
              onClick={onDeleteFile}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              {t("general.delete")}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 p-4 border-4 border-black rounded-lg bg-white">
        <h3 className="text-xl font-bold mb-2">Tipo de Embedding</h3>
        <p className="text-sm text-gray-600 mb-2">
          Selecciona el tipo de embedding que se usará para este archivo.
        </p>
        <BrutalDropDown
          buttonLabel={selectedEmbeddingTypeLabel}
          options={embeddingTypeOptions}
          onSelect={(value) => {
            if (onEmbeddingTypeChange) {
              onEmbeddingTypeChange(value);
            } else {
              updateMetadata({ embedding_type: value });
            }
          }}
          buttonWidthClass="w-full" // Make dropdown full width
        />
      </div>

      {!showCombinedForm ? (
        <>
          {metadata.processingMethod === "ocr" ||
          (isImage && // Use isImage here
            metadata.processingMethod !== "image_description") ? (
            <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
              <h3 className="text-xl font-bold">
                {t("metadataForm.ocrTitle")}
              </h3>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.title")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.title")}
                  value={metadata.title || ""}
                  onChange={(e) => updateMetadata({ title: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.author")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.author")}
                  value={metadata.author || ""}
                  onChange={(e) => updateMetadata({ author: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.tags")}
                </label>
                {renderTagSection(metadata.tags || [], addTag, removeTag)}
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.work")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.work")}
                  value={metadata.work || ""}
                  onChange={(e) => updateMetadata({ work: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.languages")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.languages")}
                  value={(metadata.languages || []).join(", ")}
                  onChange={(e) =>
                    updateMetadata({ languages: e.target.value.split(",") })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.sentiment_word")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.sentiment_word")}
                  value={metadata.sentiment_word || ""}
                  onChange={(e) =>
                    updateMetadata({ sentiment_word: e.target.value })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.sentiment_value")}
                </label>
                <BrutalInput
                  type="number"
                  step="0.1"
                  min={-1}
                  max={1}
                  value={metadata.sentiment_value || 0}
                  onChange={(e) =>
                    updateMetadata({
                      sentiment_value: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.analysis")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.analysis")}
                  value={metadata.analysis || ""}
                  onChange={(e) => updateMetadata({ analysis: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.categories")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.categories")}
                  value={(metadata.categories || []).join(", ")}
                  onChange={(e) =>
                    updateMetadata({
                      categories: e.target.value
                        .split(",")
                        .map((c) => c.trim()),
                    })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.keywords")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.keywords")}
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
                <label className="font-bold">
                  {t("metadataForm.fields.content_type")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.content_type")}
                  value={metadata.content_type || ""}
                  onChange={(e) =>
                    updateMetadata({ content_type: e.target.value })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.multilingual")}
                </label>
                <input
                  type="checkbox"
                  checked={metadata.multilingual || false}
                  onChange={(e) =>
                    updateMetadata({ multilingual: e.target.checked })
                  }
                  className="ml-2"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.content")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.content")}
                  value={metadata.content || ""}
                  onChange={(e) => updateMetadata({ content: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>
            </div>
          ) : metadata.processingMethod === "image_description" ? (
            // ... Image Description Form Fields ...
            <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
              <h3 className="text-xl font-bold">
                {t("metadataForm.imageTitle")}
              </h3>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.description")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.description")}
                  value={metadata.description || ""}
                  onChange={(e) =>
                    updateMetadata({ description: e.target.value })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.tags")}
                </label>
                {renderTagSection(metadata.tags || [], addTag, removeTag)}
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.topics")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.topics")}
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
                <label className="font-bold">
                  {t("metadataForm.fields.style")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.style")}
                  value={metadata.style || ""}
                  onChange={(e) => updateMetadata({ style: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.color_palette")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.color_palette")}
                  value={(metadata.color_palette || []).join(", ")}
                  onChange={(e) =>
                    updateMetadata({
                      color_palette: e.target.value
                        .split(",")
                        .map((c) => c.trim()),
                    })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.composition")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.composition")}
                  value={metadata.composition || ""}
                  onChange={(e) =>
                    updateMetadata({ composition: e.target.value })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>
            </div>
          ) : (
            // ... General/Manual Form Fields ...
            <div className="space-y-4 border-4 border-black rounded-lg p-4 bg-white">
              <h3 className="text-xl font-bold">
                {t("metadataForm.generalTitle")}
              </h3>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.author")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.author")}
                  value={metadata.author || ""}
                  onChange={(e) => updateMetadata({ author: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.title")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.title")}
                  value={metadata.title || ""}
                  onChange={(e) => updateMetadata({ title: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.tags")}
                </label>
                {renderTagSection(metadata.tags || [], addTag, removeTag)}
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.content")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.regularContent")}
                  value={metadata.content || ""}
                  onChange={(e) => updateMetadata({ content: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.sentiment_word")}
                </label>
                <BrutalInput
                  type="text"
                  placeholder={t("metadataForm.placeholders.sentiment_word")}
                  value={metadata.sentiment_word || ""}
                  onChange={(e) =>
                    updateMetadata({ sentiment_word: e.target.value })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.sentiment_value")}
                </label>
                <BrutalInput
                  type="number"
                  step="0.1"
                  min={-1}
                  max={1}
                  value={metadata.sentiment_value || 0}
                  onChange={(e) =>
                    updateMetadata({
                      sentiment_value: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-2 border-4 border-black rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold">
                  {t("metadataForm.fields.analysis")}
                </label>
                <BrutalInput
                  type="textarea"
                  placeholder={t("metadataForm.placeholders.analysis")}
                  value={metadata.analysis || ""}
                  onChange={(e) => updateMetadata({ analysis: e.target.value })}
                  className="w-full p-2 border-4 border-black rounded-lg h-32"
                  multiline
                />
              </div>
              {metadata.extractedText && (
                <div>
                  <label className="font-bold">
                    {t("metadataForm.fields.extractedText")}
                  </label>
                  <div className="mt-1 p-2 border-4 border-black rounded-lg bg-gray-100 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">
                      {metadata.extractedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // ... Combined Form for Images (unchanged from your code) ...
        <div className="space-y-4">
          <div className="border-4 border-black rounded-lg p-4 bg-white">
            <h3 className="text-xl font-bold mb-4">
              {t("metadataForm.ocrTitle")}
            </h3>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.title")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.title")}
                value={metadata.title || ""}
                onChange={(e) => updateMetadata({ title: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.author")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.author")}
                value={metadata.author || ""}
                onChange={(e) => updateMetadata({ author: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.tags")}
              </label>
              {renderTagSection(metadata.tags || [], addTag, removeTag)}
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.work")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.work")}
                value={metadata.work || ""}
                onChange={(e) => updateMetadata({ work: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.languages")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.languages")}
                value={(metadata.languages || []).join(", ")}
                onChange={(e) =>
                  updateMetadata({ languages: e.target.value.split(",") })
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.sentiment_word")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.sentiment_word")}
                value={metadata.sentiment_word || ""}
                onChange={(e) =>
                  updateMetadata({ sentiment_word: e.target.value })
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.sentiment_value")}
              </label>
              <BrutalInput
                type="number"
                step="0.1"
                min={-1}
                max={1}
                value={metadata.sentiment_value || 0}
                onChange={(e) =>
                  updateMetadata({
                    sentiment_value: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.analysis")}
              </label>
              <BrutalInput
                type="textarea"
                placeholder={t("metadataForm.placeholders.analysis")}
                value={metadata.analysis || ""}
                onChange={(e) => updateMetadata({ analysis: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg h-32"
                multiline
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.categories")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.categories")}
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
              <label className="font-bold">
                {t("metadataForm.fields.keywords")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.keywords")}
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
              <label className="font-bold">
                {t("metadataForm.fields.content_type")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.content_type")}
                value={metadata.content_type || ""}
                onChange={(e) =>
                  updateMetadata({ content_type: e.target.value })
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.multilingual")}
              </label>
              <input
                type="checkbox"
                checked={metadata.multilingual || false}
                onChange={(e) =>
                  updateMetadata({ multilingual: e.target.checked })
                }
                className="ml-2"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.content")}
              </label>
              <BrutalInput
                type="textarea"
                placeholder={t("metadataForm.placeholders.content")}
                value={metadata.content || ""}
                onChange={(e) => updateMetadata({ content: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg h-32"
                multiline
              />
            </div>
          </div>

          <div className="border-4 border-black rounded-lg p-4 bg-white">
            <h3 className="text-xl font-bold mb-4">
              {t("metadataForm.imageTitle")}
            </h3>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.description")}
              </label>
              <BrutalInput
                type="textarea"
                placeholder={t("metadataForm.placeholders.description")}
                value={metadata.description || ""}
                onChange={(e) =>
                  updateMetadata({ description: e.target.value })
                }
                className="w-full p-2 border-4 border-black rounded-lg h-32"
                multiline
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.topics")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.topics")}
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
              <label className="font-bold">
                {t("metadataForm.fields.style")}
              </label>
              <BrutalInput
                type="textarea"
                placeholder={t("metadataForm.placeholders.style")}
                value={metadata.style || ""}
                onChange={(e) => updateMetadata({ style: e.target.value })}
                className="w-full p-2 border-4 border-black rounded-lg h-32"
                multiline
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.color_palette")}
              </label>
              <BrutalInput
                type="text"
                placeholder={t("metadataForm.placeholders.color_palette")}
                value={(metadata.color_palette || []).join(", ")}
                onChange={(e) =>
                  updateMetadata({
                    color_palette: e.target.value
                      .split(",")
                      .map((c) => c.trim()),
                  })
                }
                className="w-full p-2 border-4 border-black rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold">
                {t("metadataForm.fields.composition")}
              </label>
              <BrutalInput
                type="textarea"
                placeholder={t("metadataForm.placeholders.composition")}
                value={metadata.composition || ""}
                onChange={(e) =>
                  updateMetadata({ composition: e.target.value })
                }
                className="w-full p-2 border-4 border-black rounded-lg h-32"
                multiline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
