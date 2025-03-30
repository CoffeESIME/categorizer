"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import BrutalButton from "./ButtonComponent/ButtonComponent";

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "es");
  const [isOpen, setIsOpen] = useState(false);

  // Actualizar el estado local cuando cambia el idioma en i18n
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <BrutalButton
        onClick={() => setIsOpen(!isOpen)}
        variant="blue"
        className="flex items-center gap-2"
      >
        <span>{t("general.languageSelector")}</span>
        <span className="ml-1">{currentLanguage === "es" ? "🇪🇸" : "🇺🇸"}</span>
      </BrutalButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white border-4 border-black rounded-lg shadow-lg z-10">
          <button
            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 ${
              currentLanguage === "es" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleLanguageChange("es")}
          >
            <span>🇪🇸</span>
            <span>{t("general.spanish")}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 ${
              currentLanguage === "en" ? "bg-gray-200" : ""
            }`}
            onClick={() => handleLanguageChange("en")}
          >
            <span>🇺🇸</span>
            <span>{t("general.english")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
