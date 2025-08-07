// src/components/BackgroundRemover.tsx
import { useRef, useState } from "react";
import { removeBg } from "../lib/u2net-run";

export default function BackgroundRemover() {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const canvas = await removeBg(img);
      setResultUrl(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFile}
        className="block"
      />
      {resultUrl && (
        <img src={resultUrl} alt="Background removed" className="max-w-full border" />
      )}
    </div>
  );
}
