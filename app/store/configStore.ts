import { create } from "zustand";

interface Model {
  label: string;
  value: string;
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
      groupName: "Text Embedding Models",
      models: [
        { label: "Granite Embeddings", value: "granite-embedding:latest" },
        { label: "Nomic Embed Text", value: "nomic-embed-text:latest" },
      ],
    },
    {
      groupName: "Vision Models",
      models: [
        { label: "Granite 3.2 Vision", value: "granite3.2-vision:latest" },
        { label: "LLaVA 34B (Multimodal)", value: "llava:34b" },
      ],
    },
    {
      groupName: "Text Analysis/Security",
      models: [
        { label: "Granite 3 Guardian", value: "granite3-guardian:latest" },
        { label: "Granite 3 Dense 8B", value: "granite3-dense:8b" },
      ],
    },
    {
      groupName: "Text Generation Models",
      models: [
        { label: "DeepSeek R1 32B", value: "deepseek-r1:32b" },
        { label: "DeepSeek R1 70B", value: "deepseek-r1:70b" },
        { label: "DeepSeek R1 14B", value: "deepseek-r1:14b" },
        { label: "Llama 3.3", value: "llama3.3:latest" },
      ],
    },
    {
      groupName: "Code Models",
      models: [
        { label: "DeepSeek Coder v2", value: "deepseek-coder-v2:latest" },
      ],
    },
    {
      groupName: "General Purpose/Text Processing",
      models: [{ label: "DeepScaler", value: "deepscaler:latest" }],
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
