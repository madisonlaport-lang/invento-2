import { useRef, useState } from "react";

type SignatureData = {
  signature: string;
  name: string;
  email: string;
};

export default function SignaturePad({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: SignatureData) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const start = () => {
    drawingRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const end = () => {
    drawingRef.current = false;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const save = () => {
    if (!name.trim() || !email.trim()) {
      alert("Veuillez renseigner le nom et l'email du signataire.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");

    onSave({
      signature: dataUrl,
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white p-5 rounded-2xl w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Signature numérique
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Renseignez les informations du signataire puis signez dans le cadre.
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom et prénom"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email du signataire"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={160}
          className="w-full border border-gray-200 rounded-lg bg-white touch-none"
          onMouseDown={start}
          onMouseUp={end}
          onMouseLeave={end}
          onMouseMove={draw}
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={save}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            Valider
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
