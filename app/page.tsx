import { CategoryButton } from "./components/LinkButton";

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-yellow-100">
      <h1 className="text-6xl font-black mb-12 -rotate-2 bg-red-400 p-6 border-4 border-black rounded-lg shadow-brutal">
        let's Organize
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CategoryButton href="/ocr" label="OCR Image" color="bg-blue-400" />
        <CategoryButton
          href="/fill-form"
          label="Fill Form"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/just-images"
          label="Just Images"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/visualizer"
          label="Visualization"
          color="bg-blue-400"
        />
        <CategoryButton
          href="/ask-something"
          label="Visualization"
          color="bg-blue-400"
        />
      </div>
    </main>
  );
}
