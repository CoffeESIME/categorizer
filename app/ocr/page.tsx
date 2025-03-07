"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  uploadImage,
  uploadJSON,
  updateVariables,
  runFlow,
  listFiles,
} from "../utils/langflowAPI";
import config from "../config.json";
import { CategoryButton } from "../components/LinkButton";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import BrutalDropDown from "../components/DropDownComponent/DropdownComponent";
import BrutalCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";

/** Estructura de los metadatos */
interface Metadata {
  author: string;
  text: string; // Aquí eventualmente irá el texto del OCR
  date: string;
  book: string;
  tags: string[];
  themes: string[];
  [key: string]: string | string[];
}

export default function ImageOcrMultiStep() {
  // Estados principales
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Para la etapa de subir imagen
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(""); // Path devuelto por /api/upload
  const [uploading, setUploading] = useState(false);

  // Para la etapa de OCR
  const [ocrResult, setOcrResult] = useState<string>(""); // Texto devuelto por /api/ocr
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [themesInput, setThemesInput] = useState<string>("");

  // Metadatos
  const [metadata, setMetadata] = useState<Metadata>({
    author: config.default_author,
    text: "",
    date: "",
    book: config.default_work,
    tags: [],
    themes: [],
  });
  const [customFields, setCustomFields] = useState<string[]>([]);

  // Configuración por defecto para OCR (podría venir de un JSON)
  const defaultOcrConfig = {
    language: "eng",
    ocr_mode: "Auto (PSM 3)",
    apply_otsu: false,
  };

  // Estado para configuración avanzada de OCR
  const [useAdvancedOcr, setUseAdvancedOcr] = useState(false);
  const [advancedOcrConfig, setAdvancedOcrConfig] = useState(defaultOcrConfig);

  // ===============================
  // Dropzone para imagen
  // ===============================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // ===============================
  // STEP 1: Subir Imagen
  // ===============================
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const uploadResponse = await uploadImage(file);
      const uploadData = await uploadResponse;
      console.log("File uploaded:", uploadData);
      setFilePath(uploadData.file_path);
      await updateVariables({
        image_path: uploadData.file_path,
      });
      setStep(2);
      const files = await listFiles();
      console.log("Files:", files);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  // ===============================
  // STEP 2: Generar OCR
  // ===============================
  async function handleGenerateOcr() {
    if (!filePath) return;
    setLoadingOcr(true);
    try {
      const ocrParams = useAdvancedOcr ? advancedOcrConfig : defaultOcrConfig;
      const ocrResponse = await runFlow({ image_path: filePath, ...ocrParams });
      const ocrData = await ocrResponse;
      console.log("OCR data:", ocrData);
      const textFound =
        ocrData.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
        ocrData.message ||
        "No text found";
      setOcrResult(textFound);
      setMetadata((prev) => ({ ...prev, text: textFound }));
      setStep(3);
    } catch (err) {
      console.error("OCR error:", err);
    } finally {
      setLoadingOcr(false);
    }
  }

  // ===============================
  // STEP 3: Metadatos
  // ===============================
  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "tags" | "themes"
  ) => {
    const values = e.target.value.split(",").map((item) => item.trim());
    setMetadata((prev) => ({ ...prev, [field]: values }));
  };

  function addCustomField() {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName && !customFields.includes(fieldName)) {
      setCustomFields((prev) => [...prev, fieldName]);
      setMetadata((prev) => ({ ...prev, [fieldName]: "" }));
    }
  }

  // ===============================
  // STEP 3: Guardar Metadatos
  // ===============================
  async function handleSaveMetadata() {
    const tagsArray = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const themesArray = themesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const submissionData = {
      imageUrl: filePath,
      ...metadata,
      tags: tagsArray,
      themes: themesArray,
    };
    try {
      const backendResponse = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (!backendResponse.ok) {
        throw new Error("Failed to submit data to backend");
      }
      console.log("Metadata submitted successfully");
      setStep(4);
    } catch (err) {
      console.error("Error submitting metadata:", err);
    }
  }

  // ===============================
  // STEP 4: Final / Nueva imagen
  // ===============================
  function handleNewImage() {
    setFile(null);
    setFilePath("");
    setOcrResult("");
    setMetadata({
      author: "",
      text: "",
      date: "",
      book: "",
      tags: [],
      themes: [],
    });
    setCustomFields([]);
    setUseAdvancedOcr(false);
    setAdvancedOcrConfig(defaultOcrConfig);
    setStep(1);
  }

  function clearAdvancedDefaults() {
    setAdvancedOcrConfig({ language: "", ocr_mode: "", apply_otsu: false });
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Send Image and OCR it" variant="neobrutalism" />
      <div className="max-w-xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-4">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Step 1: Upload Image</h2>
            <div
              {...getRootProps()}
              className={`p-6 border-4 border-black rounded-lg text-center cursor-pointer text-2xl ${
                isDragActive ? "bg-green-300 rotate-1" : "bg-blue-300 -rotate-1"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-2xl text-black font-bold">
                  File selected: {file.name}
                </p>
              ) : (
                <p className="text-2xl text-black font-bold">
                  DRAG 'N' DROP AN IMAGE HERE, OR CLICK TO SELECT
                </p>
              )}
            </div>
            <BrutalButton
              onClick={handleUpload}
              disabled={!file || uploading}
              variant="blue"
            >
              {uploading ? "Uploading..." : "UPLOAD IMAGE"}
            </BrutalButton>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex justify-between mb-4">
              <BrutalButton onClick={() => setStep(1)} variant="green">
                Go Back
              </BrutalButton>
              <h2 className="text-2xl font-bold">Step 2: Generate OCR</h2>
            </div>
            <p className="text-lg font-bold">
              Image uploaded in filepath: {filePath}
            </p>
            <BrutalButton
              onClick={() => setUseAdvancedOcr((prev) => !prev)}
              variant="teal"
            >
              {useAdvancedOcr
                ? "Ocultar configuración avanzada"
                : "Mostrar configuración avanzada"}
            </BrutalButton>
            {useAdvancedOcr && (
              <div className="mt-4 p-4 border-2 border-indigo-400 rounded-lg">
                <h3 className="text-xl font-bold mb-2">
                  Configuración Avanzada de OCR
                </h3>
                <div className="mb-2">
                  <label className="block mb-1">Idioma OCR</label>
                  <BrutalInput
                    type="text"
                    value={advancedOcrConfig.language}
                    onChange={(e) =>
                      setAdvancedOcrConfig((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    placeholder="eng o spa, etc."
                    focusBgClass="focus:bg-[#FFA6F6]"
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1">Modo OCR (PSM)</label>
                  <BrutalDropDown
                    buttonLabel={advancedOcrConfig.ocr_mode}
                    options={[
                      { label: "Auto (PSM 3)", value: "Auto (PSM 3)" },
                      {
                        label: "Un bloque (PSM 6)",
                        value: "Un bloque (PSM 6)",
                      },
                      {
                        label: "Manuscrito/Desordenado (PSM 13)",
                        value: "Manuscrito/Desordenado (PSM 13)",
                      },
                    ]}
                    onSelect={(value) =>
                      setAdvancedOcrConfig((prev) => ({
                        ...prev,
                        ocr_mode: value,
                      }))
                    }
                    buttonBgClass="bg-green-300"
                    dropdownBgClass="bg-[#FFA6F6]"
                  />
                </div>
                <div className="mb-2 flex items-center">
                  <BrutalCheckbox
                    label="Usar umbral Otsu"
                    onChange={(e) =>
                      setAdvancedOcrConfig((prev) => ({
                        ...prev,
                        apply_otsu: e.target.checked,
                      }))
                    }
                  />
                </div>
                <BrutalButton onClick={clearAdvancedDefaults} variant="red">
                  Limpiar defaults
                </BrutalButton>
              </div>
            )}
            <BrutalButton
              onClick={handleGenerateOcr}
              disabled={loadingOcr}
              variant="orange"
            >
              {loadingOcr ? "Generating OCR..." : "Generar OCR"}
            </BrutalButton>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex justify-between mb-4">
              <BrutalButton onClick={() => setStep(2)} variant="gray">
                Volver
              </BrutalButton>
              <h2 className="text-2xl font-bold">Paso 3: Metadatos</h2>
            </div>
            <p className="mb-2">Texto OCR Detectado: {ocrResult}</p>
            <textarea
              name="text"
              value={metadata.text}
              onChange={handleMetadataChange}
              placeholder="Text from OCR"
              className="w-full p-4 border-4 border-black rounded-lg text-xl bg-orange-300 placeholder-black mb-4"
            />
            <BrutalInput
              type="text"
              name="author"
              value={metadata.author}
              onChange={handleMetadataChange}
              placeholder="Author"
              className="mb-4"
            />
            <BrutalInput
              type="text"
              name="book"
              value={metadata.book}
              onChange={handleMetadataChange}
              placeholder="Book"
              className="mb-4"
            />
            <BrutalInput
              type="date"
              name="date"
              value={metadata.date}
              onChange={handleMetadataChange}
              className="mb-4"
            />
            <BrutalInput
              type="text"
              name="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (separados por coma, se permiten espacios)"
              className="mb-4"
            />
            <BrutalInput
              type="text"
              name="themes"
              value={themesInput}
              onChange={(e) => setThemesInput(e.target.value)}
              placeholder="Themes (separados por coma, se permiten espacios)"
              className="mb-4"
            />
            {customFields.map((field) => (
              <BrutalInput
                key={field}
                type="text"
                name={field}
                value={metadata[field] as string}
                onChange={handleMetadataChange}
                placeholder={field}
                className="mb-4"
              />
            ))}
            <BrutalButton onClick={addCustomField} variant="red">
              ADD CUSTOM FIELD
            </BrutalButton>
            <BrutalButton
              onClick={handleSaveMetadata}
              variant="blue"
              className="ml-4"
            >
              Guardar Metadatos
            </BrutalButton>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">¡Proceso Finalizado!</h2>
            <p>¿Quieres subir otra imagen?</p>
            <BrutalButton onClick={handleNewImage} variant="green">
              Subir otra
            </BrutalButton>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>
    </div>
  );
}
