"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === "development",
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    ns: ["common"],
    defaultNS: "common",
    keySeparator: ".",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Función para cambiar el idioma
export const changeLanguage = (lng: string) => {
  i18next.changeLanguage(lng);
  // Guardar la preferencia del usuario
  localStorage.setItem("i18nextLng", lng);
};

// Función para cargar traducciones bajo demanda
export const loadLocaleData = async (locale: string) => {
  const data = await fetch(`/locales/${locale}/common.json`);
  const translations = await data.json();
  i18next.addResourceBundle(locale, "common", translations);
};

// Cargar idiomas iniciales
export const initializeI18n = async () => {
  const storedLang =
    localStorage.getItem("i18nextLng") || navigator.language.split("-")[0];
  const validLang = ["es", "en"].includes(storedLang) ? storedLang : "es";

  try {
    await loadLocaleData(validLang);
    i18next.changeLanguage(validLang);
  } catch (error) {
    console.error("Error loading language data:", error);
    // Cargar español como fallback
    if (validLang !== "es") {
      try {
        await loadLocaleData("es");
        i18next.changeLanguage("es");
      } catch (e) {
        console.error("Error loading fallback language:", e);
      }
    }
  }
};

export default i18next;
