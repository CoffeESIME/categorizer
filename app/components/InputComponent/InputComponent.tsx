"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface BrutalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Clase Tailwind para el fondo (por defecto "bg-white") */
  bgClass?: string;
  /** Clase Tailwind para el color del texto (por defecto "text-black") */
  textClass?: string;
  /** Clase Tailwind para el borde (por defecto "border-black") */
  borderClass?: string;
  /** Clase Tailwind para la sombra (por defecto una sombra brutalista) */
  shadowClass?: string;
  /** Clase Tailwind para el fondo en estado focus (por defecto "focus:bg-gray-200") */
  focusBgClass?: string;
}

const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  (
    {
      className,
      type,
      bgClass = "bg-white",
      textClass = "text-black",
      borderClass = "border-black",
      shadowClass = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      focusBgClass = "focus:bg-gray-200",
      ...props
    },
    ref
  ) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-md border-4 px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          bgClass,
          textClass,
          borderClass,
          shadowClass,
          focusBgClass,
          "focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
BrutalInput.displayName = "BrutalInput";

export { BrutalInput };
