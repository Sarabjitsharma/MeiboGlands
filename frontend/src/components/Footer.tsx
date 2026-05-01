import { Eye } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">MeiboVision</span>
          <span>·</span>
          <span>Enhancing ocular diagnostics with AI precision.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          For research and clinical assistance only — not a substitute for medical diagnosis.
        </p>
      </div>
    </footer>
  );
};
