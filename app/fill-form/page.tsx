"use client";

import { useState } from "react";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";

export interface Metadata {
  author: string;
  text: string;
  work: string;
  tags: string;
  themes: string;
  // Puedes agregar más campos si lo requieres
}

export default function MetadataForm() {
  // Estado para los metadatos (tags y themes se mantienen como string para luego convertirlos, si es necesario)
  const [metadata, setMetadata] = useState<Metadata>({
    author: "",
    text: "",
    work: "",
    tags: "",
    themes: "",
  });
  const [generating, setGenerating] = useState(false);

  // Manejo de cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  // Función para llamar al backend y generar automáticamente tags y themes basado en el texto
  const handleGenerateMetadata = async () => {
    if (!metadata.text) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/generateMetadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: metadata.text }),
      });
      const data = await response.json();
      // Se asume que el endpoint retorna { tags: string, themes: string }
      setMetadata((prev) => ({
        ...prev,
        tags: data.tags || "",
        themes: data.themes || "",
      }));
    } catch (error) {
      console.error("Error generando metadata:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Función para enviar los metadatos al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/submitMetadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      if (!response.ok) {
        throw new Error("Error al enviar los metadatos");
      }
      alert("Metadatos enviados correctamente");
      // Reiniciar formulario
      setMetadata({
        author: "",
        text: "",
        work: "",
        tags: "",
        themes: "",
      });
    } catch (error) {
      console.error("Error en el envío:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <TitleComponent title="Send Your Data" variant="neobrutalism" />

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-4 border-4 border-black bg-white rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4">Formulario de Metadatos</h2>
        <BrutalInput
          type="text"
          name="author"
          value={metadata.author}
          onChange={handleChange}
          placeholder="Autor"
          className="w-full mb-4 text-xl"
        />
        <textarea
          name="text"
          value={metadata.text}
          onChange={handleChange}
          placeholder="Texto"
          className="w-full p-4 border-4 border-black rounded-lg text-xl bg-orange-300 placeholder-black mb-4"
        />
        <BrutalInput
          type="text"
          name="work"
          value={metadata.work}
          onChange={handleChange}
          placeholder="Obra"
          className="w-full mb-4 text-xl"
        />
        <BrutalInput
          type="text"
          name="tags"
          value={metadata.tags}
          onChange={handleChange}
          placeholder="Tags (separados por coma, espacios permitidos)"
          className="w-full mb-4 text-xl"
        />
        <BrutalInput
          type="text"
          name="themes"
          value={metadata.themes}
          onChange={handleChange}
          placeholder="Themes (separados por coma, espacios permitidos)"
          className="w-full mb-4 text-xl"
        />

        <div className="flex flex-col space-y-4">
          <BrutalButton
            type="button"
            onClick={handleGenerateMetadata}
            disabled={generating || !metadata.text}
            variant="teal"
          >
            {generating ? "Generando..." : "Generar Tags y Themes"}
          </BrutalButton>
          <BrutalButton type="submit" variant="blue">
            Enviar Metadatos
          </BrutalButton>
        </div>
      </form>
      <div className="mt-4 flex justify-center">
        <ButtonLink href="/" variant="outline" size="lg">
          <p className="text-xl">Home</p>
        </ButtonLink>
      </div>
    </div>
  );
}
