"use client";

import React, { useState, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { initializeI18n } from "./index";

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeI18n();
      setIsInitialized(true);
    };

    init();
  }, []);

  if (!isInitialized) {
    // Muestra un estado de carga mientras se inicializa i18n
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
