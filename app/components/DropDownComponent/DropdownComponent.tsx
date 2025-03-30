"use client";

import { useState } from "react";

export interface DropDownProps {
  disabled?: boolean;
  buttonLabel?: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  buttonWidthClass?: string;
  buttonBgClass?: string;
  buttonHoverBgClass?: string;
  buttonPaddingClass?: string;
  buttonBorderClass?: string;
  buttonBorderWidthClass?: string;
  buttonRoundedClass?: string;
  buttonShadowClass?: string;
  dropdownWidthClass?: string;
  dropdownBgClass?: string;
  dropdownBorderClass?: string;
  dropdownBorderWidthClass?: string;
  dropdownShadowClass?: string;
  dropdownRoundedClass?: string;
}

const BrutalDropDown: React.FC<DropDownProps> = ({
  disabled = false,
  buttonLabel = "Options",
  options,
  onSelect,
  buttonWidthClass = "w-72",
  buttonBgClass = "bg-[#B8FF9F]",
  buttonHoverBgClass = "hover:bg-[#99fc77]",
  buttonPaddingClass = "px-3 py-2",
  buttonBorderClass = "border-black",
  buttonBorderWidthClass = "border-4",
  buttonRoundedClass = "rounded-md",
  buttonShadowClass = "focus:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
  dropdownWidthClass = "w-72",
  dropdownBgClass = "bg-white",
  dropdownBorderClass = "border-black",
  dropdownBorderWidthClass = "border-4",
  dropdownShadowClass = "shadow-[2px_2px_0px_rgba(0,0,0,1)]",
  dropdownRoundedClass = "rounded-md",
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };
  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={handleClick}
          aria-expanded={open}
          aria-haspopup="true"
          className={`${buttonWidthClass} inline-flex justify-center gap-x-1.5 ${buttonBgClass} ${buttonHoverBgClass} ${buttonPaddingClass} ${buttonBorderClass} ${buttonBorderWidthClass} ${buttonRoundedClass} ${buttonShadowClass} focus:outline-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {buttonLabel}
          <svg
            className="mt-1 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div
        className={`${dropdownWidthClass} absolute right-0 z-10 mt-2 origin-top-right ${dropdownBgClass} ${dropdownShadowClass} ${dropdownBorderClass} ${dropdownBorderWidthClass} ${dropdownRoundedClass} divide-y divide-black focus:outline-none ${
          !open ? "hidden" : ""
        }`}
        role="menu"
        aria-orientation="vertical"
      >
        <div role="none">
          {options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="block w-full px-4 py-2 text-left text-sm border-b-2 border-black hover:bg-[#B8FF9F] hover:font-medium"
              role="menuitem"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrutalDropDown;
