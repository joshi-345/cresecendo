"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Search, Loader2 } from "lucide-react";
import { RadarChartComponent } from "@/components/charts/radar-chart";
import { apiPost } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

interface EmotionData {
  name: string;
  value: number;
  color: string;
}

interface LyricAnalysis {
  text: string;
  emotion: string;
  confidence: number;
}

const emotionColors: Record<string, string> = {
  Happiness: "#ffbe0b",
  Sadness: "#3a86ff",
  Anger: "#ff006e",
  Love: "#ff6b6b",
  Fear: "#8338ec",
  Hope: "#06d6a0",
  Nostalgia: "#fb5607",
  Excitement: "#7c5cfc",
  Joy: "#ffbe0b",
  Melancholy: "#3a86ff",
};

export default function EmotionCanvasPage() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [lyricLines, setLyricLines] = useState<LyricAnalysis[]>([]);
  const [overallSentiment, setOverallSentiment] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      addToast("Please enter lyrics or a song title to analyze.", "warning");
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);
    try {
      const res = await apiPost<any>("/emotions/analyze", { lyrics: query });
      setOverallSentiment(res.overall_sentiment || "Mixed");
      setEmotions(
        (res.emotions || []).map((em: any) => ({
          name: em.name,
          value: Math.round(em.value),
          color: em.color || emotionColors[em.name] || "#7c5cfc",
        }))
      );
      setLyricLines(
        (res.lyric_analysis || []).map((line: any) => ({
          text: line.text,
          emotion: line.emotion,
          confidence: line.confidence,
        }))
      );
      setShowResults(true);
      addToast("Emotion analysis complete!", "success");
    } catch (err: any) {
      console.error("Emotion analysis failed:", err);
      const msg = err?.response?.data?.detail || "Emotion analysis failed. Please try again.";
      addToast(msg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transform emotions for the radar chart
  const radarData = emotions.map((em) => ({
    subject: em.name,
    value: em.value,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent-amber/10 p-2.5">
          <Palette className="h-6 w-6 text-accent-amber" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Emotion Canvas</h1>
          <p className="text-gray-400">Deep lyrics sentiment analysis powered by NLP</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleAnalyze} className="glass-card p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste song lyrics here for emotion analysis..."
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 resize-none"
            />
          </div>
          <button type="submit" disabled={isAnalyzing} className="btn-glow flex items-center gap-2 self-end disabled:opacity-50">
            {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Palette className="h-5 w-5" />}
            Analyze
          </button>
        </div>
      </form>

      {/* Results */}
      {showResults && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Overall Sentiment */}
          {overallSentiment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card flex items-center justify-between p-6 lg:col-span-2"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-400">Overall Sentiment</h3>
                <p className="mt-1 text-2xl font-bold text-white">{overallSentiment}</p>
              </div>
              <div className="rounded-xl bg-brand-500/10 px-4 py-2">
                <span className="text-sm font-semibold text-brand-400">{emotions.length} emotions detected</span>
              </div>
            </motion.div>
          )}

          {/* Emotion Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Emotion Spectrum</h3>
            <RadarChartComponent data={radarData.length > 0 ? radarData : undefined} />
          </motion.div>

          {/* Emotion Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Emotion Breakdown</h3>
            <div className="space-y-4">
              {emotions.map((emotion) => (
                <div key={emotion.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-300">{emotion.name}</span>
                    <span className="font-medium text-white">{emotion.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${emotion.value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: emotion.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Lyric Analysis */}
          {lyricLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 lg:col-span-2"
            >
              <h3 className="mb-4 text-lg font-semibold text-white">Lyric-Level Analysis</h3>
              <div className="space-y-3">
                {lyricLines.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-elevated/50 p-4"
                  >
                    <p className="flex-1 text-sm italic text-gray-300">&ldquo;{line.text}&rdquo;</p>
                    <div className="ml-4 flex items-center gap-3">
                      <span className="rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-400">
                        {line.emotion}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(line.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
