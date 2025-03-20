"use client";

import React from "react";

export type ButtonVariant =
  | "blue"
  | "red"
  | "green"
  | "yellow"
  | "purple"
  | "orange"
  | "teal"
  | "gray";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const BrutalButton: React.FC<ButtonProps> = ({
  variant = "blue",
  children,
  disabled,
  className = "",
  ...props
}) => {
  let variantClasses = "";
  switch (variant) {
    case "blue":
      variantClasses = "bg-blue-400 text-black hover:bg-blue-500";
      break;
    case "red":
      variantClasses = "bg-red-400 text-white hover:bg-red-500";
      break;
    case "green":
      variantClasses = "bg-green-400 text-black hover:bg-green-500";
      break;
    case "yellow":
      variantClasses = "bg-yellow-400 text-black hover:bg-yellow-500";
      break;
    case "purple":
      variantClasses = "bg-purple-400 text-white hover:bg-purple-500";
      break;
    case "orange":
      variantClasses = "bg-orange-400 text-black hover:bg-orange-500";
      break;
    case "teal":
      variantClasses = "bg-teal-400 text-white hover:bg-teal-500";
      break;
    case "gray":
      variantClasses = "bg-gray-400 text-black hover:bg-gray-500";
      break;
    default:
      variantClasses = "bg-blue-400 text-black";
  }

  const baseClasses =
    "mt-4 px-6 py-4 rounded-lg text-xl font-bold border-4 border-black transform -rotate-1 transition-transform hover:rotate-0";
  const disabledClasses = disabled
    ? "disabled:bg-gray-300 disabled:cursor-not-allowed"
    : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default BrutalButton;
