"use client";

import React, { useState } from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Texto opcional para mostrar al lado del checkbox */
  label?: string;
  /** Valor inicial del checkbox */
  defaultChecked?: boolean;
  /** Clases de Tailwind para el estilo base del checkbox */
  baseClassName?: string;
  /** Clases para el estado "checked" */
  checkedStyle?: string;
  /** Clases para el estado "unchecked" */
  uncheckedStyle?: string;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
  label,
  defaultChecked = false,
  baseClassName,
  checkedStyle,
  uncheckedStyle,
  onChange,
  ...props
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(event);
    }
  };

  // Clases por defecto
  const defaultBaseClass =
    "appearance-none outline-none block relative text-center cursor-pointer m-auto w-5 h-5 before:rounded-sm before:block before:absolute before:content-[''] before:bg-[#FFC29F] before:w-5 before:h-5 before:border-black before:border-2 before:hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] after:block after:content-[''] after:absolute after:left-1.5 after:top-0.5 after:w-2 after:h-3 after:border-black after:border-r-2 after:border-b-2 after:origin-center after:rotate-45";
  const defaultCheckedStyle = " after:opacity-100 before:checked:bg-[#FF965B]";
  const defaultUncheckedStyle = " after:opacity-0";

  const combinedClassName = `${baseClassName || defaultBaseClass}${
    checked
      ? checkedStyle || defaultCheckedStyle
      : uncheckedStyle || defaultUncheckedStyle
  }`;

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={combinedClassName}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      {label && <span className="select-none">{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
