import { create } from "zustand";

export interface Model {
  // Asegúrate que Model esté exportado
  label: string;
  value: string;
  groupName?: string; // Añade groupName aquí si lo vas a usar así
}

interface ModelGroup {
  groupName: string;
  models: Model[];
}

interface OCRParameters {
  language: string;
  psm: number;
  apply_otsu: boolean;
}

interface AutoProcessSettings {
  enableAutoOCR: boolean;
  enableAutoTagging: boolean;
  enableContentAnalysis: boolean;
}

interface ConfigState {
  // === PROPIEDADES ===
  uploadDir: string;
  outputDir: string;
  defaultAuthor: string;
  forbiddenWords: string[];
  defaultWork: string;
  ocrParameters: OCRParameters;
  allModels: ModelGroup[];
  autoProcessSettings: AutoProcessSettings;
  currentLLM: string | null;

  // === MÉTODOS SETTERS ===
  setUploadDir: (dir: string) => void;
  setOutputDir: (dir: string) => void;
  setDefaultAuthor: (author: string) => void;
  setForbiddenWords: (words: string[]) => void;
  addForbiddenWord: (word: string) => void;
  removeForbiddenWord: (word: string) => void;
  setDefaultWork: (work: string) => void;
  setOcrParameter: <K extends keyof OCRParameters>(
    paramKey: K,
    value: OCRParameters[K]
  ) => void;
  setAllModels: (models: ModelGroup[]) => void;
  setAutoProcessSettings: (settings: Partial<AutoProcessSettings>) => void;
  setCurrentLLM: (llmValue: string) => void;

  // === GETTERS / MÉTODOS AUXILIARES ===
  getCurrentLLM: () => string | null;
  getModelsByGroup: (groupName: string) => Model[];
  getLLMsForType: (type: string) => Model[];
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  // === ESTADO INICIAL ===
  uploadDir: "C:\\Users\\USER\\AppData\\Local\\langflow\\langflow\\Cache",
  outputDir: "C:\\Users\\USER\\AppData\\Local\\langflow\\langflow\\Output",
  defaultAuthor: "Omar Khayyam",
  forbiddenWords: ["palabra1", "palabra2", "string_a_eliminar"],
  defaultWork: "Rubaiyat",
  ocrParameters: {
    language: "spa",
    psm: 3,
    apply_otsu: false,
  },
  allModels: [
    {
      groupName: "Vision / Multimodal Models",
      models: [
        { label: "LLaVA 13B", value: "llava:13b" },
        { label: "LLaVA 34B", value: "llava:34b" },
        { label: "Qwen VL 2.5 7B", value: "qwen2.5vl:7b" },
      ],
    },

    // ─────────── Texto generativo ───────────
    {
      groupName: "Text Generation Models",
      models: [
        { label: "Mistral 7B", value: "mistral:7b" },
        { label: "Mistral-NeMo 12B", value: "mistral-nemo:12b" },
        { label: "DeepSeek R1 14B", value: "deepseek-r1:14b" },
        { label: "DeepSeek R1 32B", value: "deepseek-r1:32b" },
        { label: "Qwen 3 8B", value: "qwen3:8b" },
        { label: "Qwen 3 14B", value: "qwen3:14b" },
        { label: "Qwen 2.5 7B", value: "qwen2.5:7b" },
        { label: "Granite 3 Dense 8B", value: "granite3-dense:8b" },
        { label: "GPT OSS", value: "gpt-oss:20b" },
      ],
    },
  ],
  autoProcessSettings: {
    enableAutoOCR: true,
    enableAutoTagging: true,
    enableContentAnalysis: true,
  },
  currentLLM: null,

  // === MÉTODOS SETTERS ===
  setUploadDir: (dir) => set(() => ({ uploadDir: dir })),
  setOutputDir: (dir) => set(() => ({ outputDir: dir })),
  setDefaultAuthor: (author) => set(() => ({ defaultAuthor: author })),
  setForbiddenWords: (words) => set(() => ({ forbiddenWords: words })),
  addForbiddenWord: (word) =>
    set((state) => ({
      forbiddenWords: [...state.forbiddenWords, word],
    })),
  removeForbiddenWord: (word) =>
    set((state) => ({
      forbiddenWords: state.forbiddenWords.filter((w) => w !== word),
    })),
  setDefaultWork: (work) => set(() => ({ defaultWork: work })),

  setOcrParameter: (paramKey, value) =>
    set((state) => ({
      ocrParameters: { ...state.ocrParameters, [paramKey]: value },
    })),

  setAllModels: (models) => set(() => ({ allModels: models })),

  setAutoProcessSettings: (settings) =>
    set((state) => ({
      autoProcessSettings: {
        ...state.autoProcessSettings,
        ...settings,
      },
    })),

  setCurrentLLM: (llmValue) => set(() => ({ currentLLM: llmValue })),

  // === GETTERS / AUXILIARES ===
  getCurrentLLM: () => get().currentLLM,

  getModelsByGroup: (groupName: string) => {
    const group = get().allModels.find((g) => g.groupName === groupName);
    return group ? group.models : [];
  },

  getLLMsForType: (type: string) => {
    // Ejemplo simple de filtrado basado en el nombre del grupo
    return get().getModelsByGroup(type);
  },
}));
