"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Search, Loader2 } from "lucide-react";
import { RadarChartComponent } from "@/components/charts/radar-chart";

const emotions = [
  { name: "Happiness", value: 72, color: "#ffbe0b" },
  { name: "Sadness", value: 45, color: "#3a86ff" },
  { name: "Anger", value: 18, color: "#ff006e" },
  { name: "Love", value: 88, color: "#ff6b6b" },
  { name: "Fear", value: 12, color: "#8338ec" },
  { name: "Hope", value: 65, color: "#06d6a0" },
  { name: "Nostalgia", value: 58, color: "#fb5607" },
  { name: "Excitement", value: 79, color: "#7c5cfc" },
];

const lyricsExcerpts = [
  { text: "Dancing under neon lights, we own the night", emotion: "Happiness", confidence: 0.94 },
  { text: "I still remember every word you said", emotion: "Nostalgia", confidence: 0.87 },
  { text: "My heart beats only for you, forever true", emotion: "Love", confidence: 0.92 },
  { text: "We rise above the storm, unbroken and reborn", emotion: "Hope", confidence: 0.89 },
];

export default function EmotionCanvasPage() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

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
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a song title, paste lyrics, or Spotify URL..."
              className="w-full rounded-xl border border-surface-border bg-surface-elevated py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500"
            />
          </div>
          <button type="submit" disabled={isAnalyzing} className="btn-glow flex items-center gap-2 disabled:opacity-50">
            {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Palette className="h-5 w-5" />}
            Analyze
          </button>
        </div>
      </form>

      {/* Results */}
      {showResults && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Emotion Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Emotion Spectrum</h3>
            <RadarChartComponent />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Lyric-Level Analysis</h3>
            <div className="space-y-3">
              {lyricsExcerpts.map((line, i) => (
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
        </div>
      )}
    </div>
  );
}
