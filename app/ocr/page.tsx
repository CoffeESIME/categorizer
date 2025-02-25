import ImageUploadForm from "../components/ImageUploadForm";
import { CategoryButton } from "../components/LinkButton";

export default function OCR() {
  return (
    <div className="container mx-auto p-4 font-bold">
      <h1 className="text-5xl mb-8 -rotate-1 inline-block bg-yellow-300 p-4 border-4 border-black">
        Image Upload OCR
      </h1>
      <ImageUploadForm />
      <CategoryButton href="/" label="Home" color="bg-blue-400" />
    </div>
  );
}
