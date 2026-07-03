"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Play, Heart, Plus, Shuffle, Loader2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

interface Recommendation {
  title: string;
  artist: string;
  reason: string;
  confidence: number;
}

const gradients = [
  "from-brand-500 to-violet-700",
  "from-accent-cyan to-teal-700",
  "from-accent-amber to-orange-700",
  "from-accent-pink to-rose-700",
  "from-emerald-500 to-green-700",
  "from-sky-500 to-blue-700",
  "from-purple-500 to-indigo-700",
  "from-rose-500 to-pink-700",
];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const fetchRecommendations = async () => {
    try {
      const res = await apiGet<any>("/recommendations");
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      addToast("Failed to load recommendations.", "error");
    }
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchRecommendations();
      setIsLoading(false);
    }
    init();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiPost("/recommendations/refresh");
      await fetchRecommendations();
      addToast("Recommendations refreshed!", "success");
    } catch (err) {
      console.error("Refresh failed:", err);
      addToast("Failed to refresh recommendations.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5">
            <Lightbulb className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">AI Discovery Engine</h1>
            <p className="text-gray-400">Personalized music recommendations powered by deep learning</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-glow flex items-center gap-2 disabled:opacity-50"
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Shuffle className="h-5 w-5" />
          )}
          Refresh
        </button>
      </div>

      {/* Recommendation Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse overflow-hidden">
              <div className="h-40 bg-surface-border" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-24 rounded bg-surface-border" />
                <div className="h-3 w-16 rounded bg-surface-border" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((rec, i) => {
            const gradient = gradients[i % gradients.length];
            return (
              <motion.div
                key={`${rec.title}-${rec.artist}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-card group overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow"
              >
                <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      <Play className="h-5 w-5 text-white" fill="white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/40 px-2 py-0.5 text-xs font-bold text-accent-cyan backdrop-blur-sm">
                    {rec.confidence}% match
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">{rec.title}</h4>
                  <p className="text-sm text-gray-400">{rec.artist}</p>
                  <p className="mt-2 text-xs text-gray-500">{rec.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-accent-pink">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-accent-cyan">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
