"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { TitleComponent } from "../../components/TitleComponent/TtitleComponent";
import BrutalButton from "../../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../../components/InputComponent/InputComponent";
import BrutalCheckbox from "../../components/CheckBoxComponent/CheckBoxComponent";
import { ButtonLink } from "../../components/ButtonLink/ButtonLink";
import categorizerAPI from "../../utils/categorizerAPI";
import SearchResultPreview from "../../components/SearchComponents/SearchResultPreview";

interface Hit {
  id: string;
  distance: number;
  file_location?: string;
  text_chunk?: string;
  original_doc_id?: string;
  page_number?: number;
  chunk_sequence?: number;
  [k: string]: any;
}

interface SearchResponse {
  image_clip?: Hit[];
  image_ocr?: Hit[];
  image_description?: Hit[];
  query_used: string;
}

export default function ImageSearchPage() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [flags, setFlags] = useState({
    use_clip: true,
    use_ocr: false,
    use_description: false,
  });
  const [kImage, setKImage] = useState(10);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const toggle = (k: keyof typeof flags) =>
    setFlags((p) => ({ ...p, [k]: !p[k] }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = {
        query,
        file,
        search_image: true,
        ...flags,
        k_image: kImage,
      };
      const res = await categorizerAPI.multimodalSearch(payload);
      const seen = new Set<string>();
      const dedupe = (arr?: Hit[]) =>
        arr?.filter((h) => {
          if (seen.has(h.id)) return false;
          seen.add(h.id);
          return true;
        });
      const clean: SearchResponse = {
        image_clip: dedupe(res.image_clip),
        image_ocr: dedupe(res.image_ocr),
        image_description: dedupe(res.image_description),
        query_used: res.query_used,
      };
      setData(clean);
    } catch (e: any) {
      setErr(e.message ?? "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderHits = (title: string, hits?: Hit[]) =>
    hits && hits.length ? (
      <div className="mb-8">
        <h2 className="font-bold text-xl mb-2">{title}</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {hits.map((h) => (
            <SearchResultPreview key={h.id} hit={h} />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="flex flex-col h-screen border-4 border-black bg-white text-black font-sans">
      <div className="p-4 border-b-4 border-black bg-white -rotate-1">
        <div className="flex justify-between items-center">
          <TitleComponent variant="neobrutalism" title="Image Search" />
          <div className="flex gap-2">
            <ButtonLink href="/ask-something" variant="outline" size="lg">
              <p className="text-xl">Volver</p>
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              <p className="text-xl">Home</p>
            </ButtonLink>
          </div>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="p-4 border-b-4 border-black bg-gray-50 flex flex-col gap-4 overflow-y-auto"
      >
        <div className="flex gap-4 flex-wrap items-end">
          <BrutalInput
            type="text"
            placeholder="Describe la imagen..."
            className="flex-1 min-w-[260px] text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <BrutalInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            label="Imagen"
            className="w-auto"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {["use_clip", "use_ocr", "use_description"].map((k) => (
            <BrutalCheckbox
              key={k}
              label={k.replace("use_", "")}
              checked={flags[k as keyof typeof flags]}
              onChange={() => toggle(k as keyof typeof flags)}
            />
          ))}
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 border-4 border-black p-2 bg-yellow-200 rounded">
            <label>k_image</label>
            <BrutalInput
              type="number"
              min="1"
              value={kImage.toString()}
              onChange={(e) => setKImage(Number(e.target.value))}
              className="w-16 bg-white"
            />
          </div>
        </div>
        <BrutalButton
          variant="red"
          disabled={loading || (!query.trim() && !file)}
          className="px-6 py-3 text-xl border-4 border-black w-fit"
        >
          {loading ? "Buscando…" : "Buscar"}
        </BrutalButton>
        {err && <p className="text-red-600 font-bold">{err}</p>}
      </form>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100" ref={resultRef}>
        {data ? (
          <>
            {renderHits("Imágenes CLIP", data.image_clip)}
            {renderHits("Imágenes OCR", data.image_ocr)}
            {renderHits("Imágenes Descripción", data.image_description)}
            {!data.image_clip?.length &&
              !data.image_ocr?.length &&
              !data.image_description?.length && (
                <p>No se encontraron coincidencias.</p>
              )}
          </>
        ) : (
          <p className="text-gray-600">Resultados aparecerán aquí…</p>
        )}
      </div>
    </div>
  );
}

