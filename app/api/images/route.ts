import { NextResponse } from "next/server";

// This is a mock function. In a real application, you would fetch this data from your database.
async function getImagesFromDatabase() {
  return [
    { id: "1", url: "https://example.com/image1.jpg" },
    { id: "2", url: "https://example.com/image2.jpg" },
    { id: "3", url: "https://example.com/image3.jpg" },
  ];
}

export async function GET() {
  try {
    const images = await getImagesFromDatabase();
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching images" },
      { status: 500 }
    );
  }
}
