"use client";
import { CategoryButton } from "./components/LinkButton";
import { Marquee } from "./components/MarqueeComponent/MarqueeComponent";
import { Badge } from "./components/BadgeComponent/BadgeComponent";
import React from "react";
import { TitleComponent } from "./components/TitleComponent/TtitleComponent";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const marqueeOptions = t("homepage.marquee", {
    returnObjects: true,
  }) as string[];
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title={t("homepage.title")} variant="red" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <CategoryButton
          href="/upload-files"
          label={t("nav.upload")}
          color="bg-blue-400"
        />
        <CategoryButton
          href="/pending"
          label={t("nav.pending")}
          color="bg-blue-400"
        />
        <CategoryButton
          href="/text-processing"
          label={t("nav.textProcessing")}
          color="bg-blue-400"
        />
        <CategoryButton
          href="/node-management"
          label={t("nav.nodeManagement")}
          color="bg-blue-400"
        />
        <CategoryButton
          href="/visualizer"
          label={t("nav.visualizer")}
          color="bg-blue-400"
        />
        <CategoryButton
          href="/ask-something"
          color="bg-blue-400"
          label={t("nav.chatRAG")}
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
