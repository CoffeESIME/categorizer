"use client";
import { CategoryButton } from "./components/LinkButton";
import { Marquee } from "./components/MarqueeComponent/MarqueeComponent";
import { Badge } from "./components/BadgeComponent/BadgeComponent";
import React from "react";
import { TitleComponent } from "./components/TitleComponent/TtitleComponent";
export default function Home() {
  const marqueeOptions = [
    "Organize",
    "Great Visuals",
    "Categorize",
    "Connect & Discover",
    "Empower Insights",
    "Simplify Data",
    "Intelligent Mapping",
    "Organize",
  ];
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Let's Categorize It" variant="red" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <CategoryButton
          href="/upload-files"
          label="Subir Archivos"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/pending"
          label="Pendientes"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/text-processing"
          label="Procesar Texto"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/node-management"
          label="Node Management"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/visualizer"
          label="Visualization"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/ask-something"
          color="bg-blue-400"
          label="chat RAG"
        />
      </div>
      <Marquee className="mb-8 mt-12" speed="slow">
        <div className="flex items-center gap-4 px-4">
          {marqueeOptions.map((option, idx) => (
            <React.Fragment key={idx}>
              {idx % 2 === 0 ? (
                <Badge variant="outline" className="text-base">
                  {option}
                </Badge>
              ) : (
                <span className="text-base">{option}</span>
              )}
              <span className="text-lg font-bold">|</span>
            </React.Fragment>
          ))}
        </div>
      </Marquee>
    </main>
  );
}
