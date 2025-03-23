"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone"; // Si lo requieres en algún otro flujo
import { TitleComponent } from "../components/TitleComponent/TtitleComponent";
import BrutalButton from "../components/ButtonComponent/ButtonComponent";
import { BrutalInput } from "../components/InputComponent/InputComponent";
import BrutalDropDown from "../components/DropDownComponent/DropdownComponent";
import BrutalCheckbox from "../components/CheckBoxComponent/CheckBoxComponent";
import { ButtonLink } from "../components/ButtonLink/ButtonLink";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function RagBrutalistChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "¡Bienvenido! Configura tus opciones y haz una pregunta.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-3.5");
  const [temperature, setTemperature] = useState(0.7);
  const [retrievalMethod, setRetrievalMethod] = useState("vector");
  const [tools, setTools] = useState<string[]>([]);
  const [topK, setTopK] = useState(3);
  const [chunkSize, setChunkSize] = useState(512);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleSend = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    const newUserMessage: ChatMessage = { role: "user", content: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    try {
      const response = await fetch("/api/ragChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          config: {
            model,
            temperature,
            retrievalMethod,
            tools,
            topK,
            chunkSize,
          },
        }),
      });
      if (!response.ok) throw new Error("Error en la llamada a /api/ragChat");
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.assistantMessage || "Sin respuesta.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error en el chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ocurrió un error al procesar tu mensaje.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };
  const toggleTool = (toolName: string) => {
    setTools((prev) =>
      prev.includes(toolName)
        ? prev.filter((t) => t !== toolName)
        : [...prev, toolName]
    );
  };

  return (
    <div className="flex flex-col h-screen border-4 border-black bg-white text-black font-sans">
      <div className="p-4 border-b-4 border-black bg-white -rotate-1 transform origin-top-left">
        <div className="flex justify-between items-center">
          <TitleComponent title="Chat RAG Data" variant="neobrutalism" />
          <ButtonLink href="/" variant="outline" size="lg">
            <p className="text-xl">Home</p>
          </ButtonLink>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex flex-col border-4 border-black p-2 bg-pink-300 rounded-lg">
            <label className="font-bold mb-1">Modelo:</label>
            <BrutalDropDown
              buttonLabel={model}
              options={[
                { label: "GPT-3.5", value: "gpt-3.5" },
                { label: "GPT-4", value: "gpt-4" },
                { label: "LLaMA2", value: "llama2" },
              ]}
              onSelect={(value) => setModel(value)}
              buttonBgClass="bg-pink-300"
              dropdownBgClass="bg-white"
            />
          </div>
          <div className="flex flex-col border-4 border-black p-2 bg-yellow-300 rounded-lg">
            <label className="font-bold mb-1">Temperatura:</label>
            <BrutalInput
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={temperature.toString()}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-20 bg-white"
            />
          </div>
          <div className="flex flex-col border-4 border-black p-2 bg-green-300 rounded-lg">
            <label className="font-bold mb-1">Retrieval:</label>
            <BrutalDropDown
              buttonLabel={retrievalMethod}
              options={[
                { label: "Vector DB", value: "vector" },
                { label: "Graph DB", value: "graph" },
                { label: "Híbrido", value: "hybrid" },
              ]}
              onSelect={(value) => setRetrievalMethod(value)}
              buttonBgClass="bg-green-300"
              dropdownBgClass="bg-white"
            />
          </div>
          <div className="flex flex-col border-4 border-black p-2 bg-blue-300 rounded-lg">
            <label className="font-bold mb-1">Herramientas:</label>
            <div className="space-y-1">
              <BrutalCheckbox
                label="Calculadora"
                checked={tools.includes("calculator")}
                onChange={() => toggleTool("calculator")}
              />
              <BrutalCheckbox
                label="Wikipedia"
                checked={tools.includes("wikipedia")}
                onChange={() => toggleTool("wikipedia")}
              />
            </div>
          </div>
          <div className="flex flex-col border-4 border-black p-2 bg-orange-300 rounded-lg">
            <label className="font-bold mb-1">Top K:</label>
            <BrutalInput
              type="number"
              min="1"
              value={topK.toString()}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-16 bg-white"
            />
          </div>
          <div className="flex flex-col border-4 border-black p-2 bg-purple-300 rounded-lg">
            <label className="font-bold mb-1">Chunk Size:</label>
            <BrutalInput
              type="number"
              min="128"
              value={chunkSize.toString()}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-20 bg-white"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto border-b-4 border-black bg-gray-100 relative">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 mb-4 max-w-2xl border-4 border-black rounded-lg ${
              msg.role === "system"
                ? "bg-gray-300 self-center mx-auto"
                : msg.role === "assistant"
                ? "bg-green-200 self-start"
                : "bg-blue-200 self-end"
            }`}
          >
            <b className="uppercase">{msg.role}:</b> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white -rotate-1 transform origin-bottom-left border-4 border-black">
        <div className="flex space-x-3">
          <BrutalInput
            type="text"
            placeholder="Escribe tu pregunta..."
            className="flex-1 p-4 border-4 border-black rounded-lg text-xl bg-white placeholder-black"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSend();
              }
            }}
          />
          <BrutalButton
            onClick={handleSend}
            disabled={isLoading}
            variant="red"
            className="px-6 py-4 rounded-lg text-xl border-4 border-black transition-transform hover:rotate-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}
