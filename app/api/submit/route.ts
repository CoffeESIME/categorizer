// app/api/submit/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Aquí guardas en DB o procesas como desees
    console.log("Recibido en /api/submit:", data);

    return NextResponse.json({ message: "Data received successfully" });
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json(
      { error: "Error processing submission" },
      { status: 500 }
    );
  }
}
