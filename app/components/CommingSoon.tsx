import Link from "next/link";
import React from "react";

interface CommingSoonPageProps {
  title?: string;
  description?: string;
  link?: string;
  linkText?: string;
  containerBgColor?: string;
  headerBgColor?: string;
  containerClassName?: string;
  headerClassName?: string;
  children?: React.ReactNode;
}

export default function CommingSoonPage({
  title = "Visualize Data",
  description = "Visualization features coming soon!",
  link = "/",
  linkText = "Back to Home",
  containerBgColor = "bg-purple-100",
  headerBgColor = "bg-purple-400",
  containerClassName = "",
  headerClassName = "",
  children,
}: CommingSoonPageProps) {
  return (
    <div
      className={`container mx-auto p-4 min-h-screen flex flex-col items-center justify-center ${containerBgColor} ${containerClassName}`}
    >
      <h1
        className={`text-5xl font-black mb-8 rotate-2 ${headerBgColor} p-4 border-4 border-black rounded-lg shadow-brutal ${headerClassName}`}
      >
        {title}
      </h1>
      {children ? children : <p className="text-2xl mb-8">{description}</p>}
      <Link
        href={link}
        className="bg-yellow-400 text-black text-xl font-bold py-4 px-6 rounded-lg border-4 border-black shadow-brutal hover:shadow-brutal-hover transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1"
      >
        {linkText}
      </Link>
    </div>
  );
}
