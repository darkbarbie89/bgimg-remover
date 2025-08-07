import { useRef, useState } from "react";
import { BackgroundRemover } from "../utils/onnx";

export default function RemoverDemo() {
  const [remover] = useState(() => new BackgroundRemover());
  const [loading, setLoading] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const canvas = await remover.removeBackground(img);
      setOutUrl(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
      setLoading(false);
    };
    img.src = url;
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm"
      />

      {loading && <p className="text-sm text-gray-500">Processing…</p>}

      {outUrl && (
        <img
          src={outUrl}
          alt="Result"
          className="max-w-full border rounded shadow"
        />
      )}
    </div>
  );
}
