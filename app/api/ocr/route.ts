// app/api/ocr/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Leemos el JSON que contiene la file_path devuelta de /api/upload
    //    (p.ej: { file_path: "a430cc57-06bb-4c11-be39-d3d4de68d2c4/..." })
    const { file_path } = await request.json();
    if (!file_path) {
      return NextResponse.json(
        { error: "No file_path provided" },
        { status: 400 }
      );
    }

    // 2. Ajusta estos valores
    const flowId = "TU_FLOW_ID_DE_LANGFLOW"; // Debe ser el que tenga TesseractOCR
    const langflowUrl =
      process.env.NEXT_PUBLIC_LANGFLOW_URL || "http://127.0.0.1:7860";
    const langflowApiKey = process.env.LANGFLOW_API_KEY;
    // ID del ChatInput en tu flow, p.ej. "ChatInput-abc123"
    const chatInputId = "ChatInput-abc123";

    // 3. Preparamos la request
    const body = {
      tweaks: {
        // Este "ChatInput-abc123" depende de tu Flow real
        [chatInputId]: {
          files: file_path,
          input_value: "Extrae el texto por OCR", // O lo que quieras
        },
      },
    };

    // 4. Llamamos a /run
    const response = await fetch(
      `${langflowUrl}/api/v1/run/${flowId}?stream=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": langflowApiKey ?? "",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Error running OCR flow in Langflow");
    }

    const result = await response.json();
    // Normalmente, 'result' contiene un "message" con el texto

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/ocr:", error);
    return NextResponse.json(
      { error: "Failed to process OCR" },
      { status: 500 }
    );
  }
}
