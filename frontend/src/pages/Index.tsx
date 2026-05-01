import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { UploadCard } from "@/components/UploadCard";
import { ResultsView } from "@/components/ResultsView";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Footer } from "@/components/Footer";

type Status = "idle" | "processing" | "done";

const Index = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [image, setImage] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "MeiboVision — AI Meibomian Gland Analysis";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "MeiboVision: AI-powered meibomian gland segmentation and ocular diagnostics for ophthalmologists. Precision-driven analysis in seconds."
    );
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  const handleAnalyze = (img: string) => {
    setImage(img);
    setStatus("processing");
    setTimeout(() => setStatus("done"), 2400);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const handleReset = () => {
    setStatus("idle");
    setImage(null);
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header />

      <main>
        <Hero onStart={scrollToUpload} />

        <div id="upload-section" ref={uploadRef} className="container scroll-mt-20 pb-10">
          <div className="mx-auto max-w-4xl">
            <UploadCard onAnalyze={handleAnalyze} />
          </div>
        </div>

        <AnimatePresence>
          {status !== "idle" && image && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              id="results"
              className="container mx-auto max-w-6xl scroll-mt-20 pb-10"
            >
              <ResultsView image={image} status={status} onReset={handleReset} />
              <InsightsPanel loading={status === "processing"} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
