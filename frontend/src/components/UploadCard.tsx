import { useCallback, useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, X } from "lucide-react";
import sampleEyelid from "@/assets/sample-eyelid.jpg";

interface UploadCardProps {
  onAnalyze: (imageUrl: string) => void;
}

export const UploadCard = ({ onAnalyze }: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Invalid format. Please upload JPG or PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const useSample = () => {
    setPreview(sampleEyelid);
    setFileName("sample-eyelid.jpg");
    setError(null);
  };

  const reset = () => {
    setPreview(null);
    setFileName("");
    setError(null);
  };

  return (
    <div className="relative rounded-3xl border border-border bg-gradient-card p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Step 1 — Image input
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Upload Inner Eyelid Image
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Our AI model segments meibomian glands and reports dropout metrics.
          </p>
        </div>
        <button
          onClick={useSample}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ImageIcon className="h-4 w-4" /> Use sample image
        </button>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all ${
            dragOver
              ? "border-primary bg-primary-soft scale-[1.01]"
              : "border-border bg-secondary/40 hover:border-primary/40 hover:bg-primary-soft/40"
          }`}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
            <UploadCloud className="h-8 w-8 text-primary-foreground" strokeWidth={2} />
          </div>
          <p className="text-base font-semibold text-foreground">
            Drag & drop your eyelid image here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or <span className="font-semibold text-primary">browse files</span>
          </p>
          <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-md bg-background px-2 py-1 ring-1 ring-border">JPG</span>
            <span className="rounded-md bg-background px-2 py-1 ring-1 ring-border">PNG</span>
            <span>Max 10 MB</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Uploaded eyelid preview"
              className="h-full w-full object-cover"
            />
            <button
              onClick={reset}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card backdrop-blur transition-colors hover:bg-background"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">{fileName}</span>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              Ready
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Images are processed locally in this demo and never leave your browser.
        </p>
        <button
          disabled={!preview}
          onClick={() => preview && onAnalyze(preview)}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:shadow-elevated disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-card"
        >
          <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
          Upload & Analyze
        </button>
      </div>
    </div>
  );
};
