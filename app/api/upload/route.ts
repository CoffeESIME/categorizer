// app/api/upload/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Leemos el formData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Preparamos datos para Langflow
    const flowId = "TU_FLOW_ID_DE_LANGFLOW"; // p.ej. "a430cc57-06bb-4c11-be39-d3d4de68d2c4"
    const langflowUrl =
      process.env.NEXT_PUBLIC_LANGFLOW_URL || "http://127.0.0.1:7860";
    const langflowApiKey = process.env.LANGFLOW_API_KEY;

    const langflowFormData = new FormData();
    langflowFormData.append("file", file);

    // 3. Subimos a Langflow
    const response = await fetch(
      `${langflowUrl}/api/v1/files/upload/${flowId}`,
      {
        method: "POST",
        headers: {
          "x-api-key": langflowApiKey ?? "",
        },
        body: langflowFormData,
      }
    );

    if (!response.ok) {
      throw new Error("Error uploading file to Langflow");
    }

    const data = await response.json();
    // data.file_path => "flowId/2024-12-30_15-42-44_image-file.png", etc.

    return NextResponse.json({ message: "File uploaded", ...data });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
