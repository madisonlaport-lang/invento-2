import { useRef } from "react";

export default function SignaturePad({ onClose, onSave }) {
  const canvasRef = useRef(null);
  let drawing = false;

  const start = () => (drawing = true);
  const end = () => (drawing = false);

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const save = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl">
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          className="border"
          onMouseDown={start}
          onMouseUp={end}
          onMouseMove={draw}
        />

        <div className="flex gap-2 mt-2">
          <button onClick={save}>Valider</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
