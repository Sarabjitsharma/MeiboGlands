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
  const [resultImage, setResultImage] = useState<string | null>(null);
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

  const handleAnalyze = async (img: string, file: File | null) => {
    setImage(img);
    setStatus("processing");
    setResultImage(null);
    
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch("http://127.0.0.1:8000/infer", {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          setResultImage(URL.createObjectURL(blob));
          setStatus("done");
        } else {
          console.error("Inference failed");
          setStatus("idle");
        }
      } catch (error) {
        console.error("Error making inference request", error);
        setStatus("idle");
      }
    } else {
      // Fallback for sample image if needed
      setTimeout(() => setStatus("done"), 2400);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setImage(null);
    setResultImage(null);
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
              <ResultsView image={image} resultImage={resultImage} status={status} onReset={handleReset} />
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
