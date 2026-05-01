import { useState } from "react";
import { Eye, EyeOff, Loader2, Download, RefreshCw } from "lucide-react";

interface ResultsViewProps {
  image: string;
  resultImage?: string | null;
  status: "processing" | "done";
  onReset: () => void;
}

export const ResultsView = ({ image, resultImage, status, onReset }: ResultsViewProps) => {
  const [showOverlay, setShowOverlay] = useState(true);

  const isProcessing = status === "processing";

  return (
    <section className="animate-fade-up">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Step 2 — Segmentation results
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Analysis Output
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the original capture alongside the AI-segmented gland map.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlay((v) => !v)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            {showOverlay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showOverlay ? "Hide overlay" : "Show overlay"}
          </button>
          <button
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
          >
            <RefreshCw className="h-4 w-4" /> New scan
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePanel label="Original Capture" image={image} />
        <ImagePanel
          label="Segmentation Overlay"
          image={showOverlay && resultImage ? resultImage : image}
          processing={isProcessing}
          accent
        />
      </div>
    </section>
  );
};

interface PanelProps {
  label: string;
  image: string;
  processing?: boolean;
  accent?: boolean;
}

const ImagePanel = ({ label, image, processing, accent }: PanelProps) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${accent ? "bg-accent" : "bg-primary"}`}
          />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>
        {accent && !processing && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
            AI Generated
          </span>
        )}
        {processing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Loader2 className="h-3 w-3 animate-spin" /> Processing
          </span>
        )}
      </div>

      <div className="group relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={image}
          alt={label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {processing && (
          <>
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
            <div className="scan-line" />
            <div className="absolute inset-0 grid-bg opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/90 shadow-elevated">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Analyzing glands…
              </p>
              <p className="text-xs text-muted-foreground">
                Detecting morphology & dropout
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
