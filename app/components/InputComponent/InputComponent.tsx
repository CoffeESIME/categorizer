"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface BrutalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  multiline?: boolean;
  bgClass?: string;
  textClass?: string;
  borderClass?: string;
  shadowClass?: string;
  focusBgClass?: string;
}

const BrutalInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  BrutalInputProps
>(
  (
    {
      className,
      multiline = false,
      type = "text",
      bgClass = "bg-white",
      textClass = "text-black",
      borderClass = "border-black",
      shadowClass = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      focusBgClass = "focus:bg-gray-200",
      ...props
    },
    ref
  ) => {
    const commonClasses = cn(
      "w-full rounded-md border-4 px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-50",
      bgClass,
      textClass,
      borderClass,
      shadowClass,
      focusBgClass,
      "focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] focus:outline-none",
      className
    );

    if (multiline) {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={cn("min-h-[3rem]", commonClasses)}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={type}
        ref={ref as React.Ref<HTMLInputElement>}
        className={cn("h-12", commonClasses)}
        {...props}
      />
    );
  }
);

BrutalInput.displayName = "BrutalInput";

export { BrutalInput };
