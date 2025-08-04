"use client";

import React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean; // ← obligatorio
  onChange: (checked: boolean) => void; // ← devuelve el nuevo valor
  baseClassName?: string;
  checkedStyle?: string;
  uncheckedStyle?: string;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  baseClassName,
  checkedStyle,
  uncheckedStyle,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.checked);

  const defaultBase =
    "appearance-none outline-none block relative text-center cursor-pointer m-auto w-5 h-5 before:rounded-sm before:block before:absolute before:content-[''] before:bg-[#FFC29F] before:w-5 before:h-5 before:border-black before:border-2 before:hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] after:block after:content-[''] after:absolute after:left-1.5 after:top-0.5 after:w-2 after:h-3 after:border-black after:border-r-2 after:border-b-2 after:origin-center after:rotate-45";
  const defaultChecked = " after:opacity-100 before:checked:bg-[#FF965B]";
  const defaultUnchecked = " after:opacity-0";

  const className = `${baseClassName || defaultBase}${
    checked
      ? checkedStyle || defaultChecked
      : uncheckedStyle || defaultUnchecked
  }`;

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={className}
        checked={checked}
        onChange={handleChange}
        name={label}
        {...props}
      />
      {label && <span className="select-none">{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
