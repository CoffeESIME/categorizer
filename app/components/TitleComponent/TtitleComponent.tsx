"use client";

import React from "react";

export type TitleVariant = "yellow" | "red" | "neobrutalism";

export interface TitleComponentProps {
  title: string;
  subTitle?: string;
  variant?: TitleVariant;
  className?: string;
}

export const TitleComponent: React.FC<TitleComponentProps> = ({
  title,
  subTitle,
  variant = "yellow",
  className = "",
}) => {
  let baseStyle = "";
  let content: React.ReactNode = title;

  switch (variant) {
    case "yellow":
      baseStyle =
        "text-5xl mb-8 -rotate-1 inline-block bg-yellow-300 p-4 border-4 border-black";
      break;
    case "red":
      baseStyle =
        "text-6xl font-black mb-12 -rotate-2 bg-red-400 p-6 border-4 border-black rounded-lg shadow-brutal";
      break;
    case "neobrutalism":
      baseStyle = "text-5xl md:text-7xl font-black mb-4 relative";
      content = (
        <>
          <span className="bg-[#ffde59] px-2 -mx-2 rotate-1 inline-block transform">
            {title}
          </span>
          {subTitle && <span className="block">{subTitle}</span>}
        </>
      );
      break;
    default:
      baseStyle = "";
  }

  return <h1 className={`${baseStyle} ${className}`}>{content}</h1>;
};
