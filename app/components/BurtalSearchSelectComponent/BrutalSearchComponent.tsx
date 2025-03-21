"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { BrutalInput } from "../InputComponent/InputComponent";

interface SearchSelectOption {
  value: string;
  label: string;
}

export interface BrutalSearchSelectProps {
  options: SearchSelectOption[];
  onSelect: (value: any) => void;
  selectedValue?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

/**
 * Select con estilo neobrutalista que incluye un input de búsqueda
 * para filtrar las opciones disponibles en tiempo real.
 */
const BrutalSearchSelect: React.FC<BrutalSearchSelectProps> = ({
  options,
  onSelect,
  selectedValue,
  placeholder = "Buscar...",
  label = "",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filtramos las opciones según el texto ingresado.
  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);
  return (
    <div className={cn("relative", className)}>
      {label && <label className="font-bold block mb-1">{label}</label>}

      <BrutalInput
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-2"
      />

      <div className="max-h-48 overflow-auto border-4 border-black p-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        {filteredOptions.length === 0 && (
          <div className="text-gray-500">No hay resultados</div>
        )}
        {filteredOptions.map((opt) => (
          <div
            key={opt.value}
            className={cn(
              "cursor-pointer p-1 hover:bg-gray-200",
              opt.label === selectedValue && "bg-red-300"
            )}
            onClick={() => onSelect(opt)}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrutalSearchSelect;
