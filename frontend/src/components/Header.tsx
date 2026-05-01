import { Eye } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Eye className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background animate-pulse-soft" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-foreground">
              MeiboVision
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              AI-powered ocular diagnostics
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {["Dashboard", "Analyze", "Reports"].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${i === 0
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">Dr. A. Karimov</p>
            <p className="text-xs text-muted-foreground">Ophthalmology</p>
          </div>
          <button
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground ring-1 ring-border transition-all hover:shadow-glow"
          >
            AK
          </button>
        </div>
      </div>
    </header>
  );
};
