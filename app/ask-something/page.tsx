"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import BrutalCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";
import categorizerAPI from "../utils/categorizerAPI";

/* ──────────────── Tipos ──────────────── */
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
  text_results?: Hit[];
  pdf_results?: Hit[];
  image_clip?: Hit[];
  image_ocr?: Hit[];
  image_description?: Hit[];
  query_used: string;
}

/* ──────────────── Componente ──────────────── */
export default function RagBrutalistSearch() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /* flags & k */
  const [flags, setFlags] = useState({
    search_text: true,
    search_pdf: false,
    search_image: true,
    use_clip: true,
    use_ocr: false,
    use_description: false,
  });
  const [ks, setKs] = useState({ k_text: 5, k_pdf: 20, k_image: 10 });

  /* UI state */
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openChunk, setOpenChunk] = useState<null | {
    text: string;
    meta: Hit;
  }>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  /* helpers */
  const toggle = (k: keyof typeof flags) =>
    setFlags((p) => ({ ...p, [k]: !p[k] }));
  const updateK = (dom: "text" | "pdf" | "image", val: number) =>
    setKs((p) => ({ ...p, [`k_${dom}`]: val }));

  /* submit */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = { query, ...flags, ...ks, file };
      const res = await categorizerAPI.multimodalSearch(payload);
      setData(res);
    } catch (e: any) {
      setErr(e.message ?? "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* render hits */
  const renderHits = (title: string, hits?: Hit[]) =>
    hits && hits.length ? (
      <div className="mb-8">
        <h2 className="font-bold text-xl mb-2">{title}</h2>
        <div className="grid gap-2">
          {hits.map((h) => {
            /* PDF: botón que abre modal, demás: enlace */
            const isPdf = h.text_chunk !== undefined;
            const fileName =
              h.file_location?.split("/").pop() ??
              h.original_doc_id ??
              "sin_nombre";

            return isPdf ? (
              <button
                key={h.id}
                onClick={() => setOpenChunk({ text: h.text_chunk!, meta: h })}
                className="text-left border-4 border-black bg-white p-2 hover:bg-yellow-100 text-sm break-all"
              >
                <b>Pág.</b> {h.page_number} | <b>Dist.</b>{" "}
                {h.distance.toFixed(3)} | <b>File:</b> {fileName}
              </button>
            ) : (
              <a
                key={h.id}
                href={
                  h.file_location
                    ? `http://127.0.0.1:8000/uploads/${h.file_location}`
                    : "#"
                }
                target="_blank"
                className="border-4 border-black bg-white p-2 hover:bg-yellow-100 text-sm break-all"
              >
                <b>ID:</b> {h.id.slice(0, 8)}… | <b>Dist.</b>{" "}
                {h.distance.toFixed(3)} | <b>File:</b> {fileName}
              </a>
            );
          })}
        </div>
      </div>
    ) : null;

  /* ──────────────── JSX ──────────────── */
  return (
    <div className="flex flex-col h-screen border-4 border-black bg-white text-black font-sans">
      {/* header */}
      <div className="p-4 border-b-4 border-black bg-white -rotate-1">
        <div className="flex justify-between items-center">
          <TitleComponent
            variant="neobrutalism"
            title="RAG Multimodal Search"
          />
          <ButtonLink href="/" variant="outline" size="lg">
            <p className="text-xl">Home</p>
          </ButtonLink>
        </div>
      </div>

      {/* form */}
      <form
        onSubmit={onSubmit}
        className="p-4 border-b-4 border-black bg-gray-50 flex flex-col gap-4 overflow-y-auto"
      >
        {/* query */}
        <div className="flex gap-4 flex-wrap">
          <BrutalInput
            type="text"
            placeholder="¿Qué buscas?"
            className="flex-1 min-w-[260px] border-4 border-black p-3 text-lg bg-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border-2 border-black p-1"
          />
        </div>

        {/* checkboxes */}
        <div className="flex gap-4 flex-wrap">
          {["search_text", "search_pdf", "search_image"].map((k) => (
            <BrutalCheckbox
              key={k}
              label={k}
              checked={flags[k as keyof typeof flags]}
              onChange={() => toggle(k as keyof typeof flags)}
            />
          ))}
          {flags.search_image &&
            ["use_clip", "use_ocr", "use_description"].map((k) => (
              <BrutalCheckbox
                key={k}
                label={k.replace("use_", "")}
                checked={flags[k as keyof typeof flags]}
                onChange={() => toggle(k as keyof typeof flags)}
              />
            ))}
        </div>

        {/* k values */}
        <div className="flex gap-4 flex-wrap">
          {(["text", "pdf", "image"] as const).map((dom) => (
            <div
              key={dom}
              className="flex items-center gap-2 border-4 border-black p-2 bg-yellow-200 rounded"
            >
              <label>k_{dom}</label>
              <BrutalInput
                type="number"
                min="1"
                value={ks[`k_${dom}`].toString()}
                onChange={(e) => updateK(dom, Number(e.target.value))}
                className="w-16 bg-white"
              />
            </div>
          ))}
        </div>

        <BrutalButton
          variant="red"
          disabled={loading || !query.trim()}
          className="px-6 py-3 text-xl border-4 border-black w-fit"
        >
          {loading ? "Buscando…" : "Buscar"}
        </BrutalButton>
        {err && <p className="text-red-600 font-bold">{err}</p>}
      </form>

      {/* results */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100" ref={resultRef}>
        {data ? (
          <>
            {renderHits("Textos", data.text_results)}
            {renderHits("PDF Chunks", data.pdf_results)}
            {renderHits("Imágenes CLIP", data.image_clip)}
            {renderHits("Imágenes OCR", data.image_ocr)}
            {renderHits("Imágenes Descripción", data.image_description)}
            {!Object.keys(data).some(
              (k) => k.endsWith("_results") || k.startsWith("image_")
            ) && <p>No se encontraron coincidencias.</p>}
          </>
        ) : (
          <p className="text-gray-600">Resultados aparecerán aquí…</p>
        )}
      </div>

      {/* modal chunk */}
      {openChunk && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-6 max-w-3xl max-h-[80vh] overflow-y-auto space-y-4 rounded-lg">
            <h3 className="font-bold">
              {openChunk.meta.original_doc_id} — pág.{" "}
              {openChunk.meta.page_number}
            </h3>
            <pre className="whitespace-pre-wrap text-sm">{openChunk.text}</pre>
            <BrutalButton variant="red" onClick={() => setOpenChunk(null)}>
              Cerrar
            </BrutalButton>
          </div>
        </div>
      )}
    </div>
  );
}
