import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Layers } from "lucide-react";
import { HeroVisual } from "./HeroVisual";

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Clinical-grade segmentation engine — v2.4
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Meibomian Gland{" "}
            <span className="text-gradient">Analysis</span>,
            <br className="hidden sm:block" /> made precise.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload inner eyelid images and get pixel-accurate gland segmentation,
            dropout quantification, and clinical insights in seconds.
          </p>
          <p className="mt-2 text-sm italic text-muted-foreground">
            “Precision-driven ocular diagnostics powered by AI.”
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-shadow hover:shadow-elevated"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
            >
              View demo report
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Pill icon={ShieldCheck}>HIPAA-aligned</Pill>
            <Pill icon={Zap}>~3s analysis</Pill>
            <Pill icon={Layers}>Pixel-level segmentation</Pill>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative aspect-square w-full lg:aspect-[5/4]"
        >
          <div className="absolute inset-0">
            <HeroVisual />
          </div>
          {/* HUD chips */}
          {/* <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute left-2 top-8 glass rounded-2xl px-3 py-2 text-xs shadow-card sm:left-6"
          >
            <p className="font-semibold text-foreground">Live segmentation</p>
            <p className="text-muted-foreground">22 glands detected</p>
          </motion.div> */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute bottom-8 right-2 glass rounded-2xl px-3 py-2 text-xs shadow-card sm:right-6"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              <p className="font-semibold text-foreground">Healthy range</p>
            </div>
            <p className="text-muted-foreground">Visibility 82 / 100</p>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
};

const Pill = ({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 font-medium text-foreground shadow-soft backdrop-blur">
    <Icon className="h-3.5 w-3.5 text-primary" />
    {children}
  </span>
);
