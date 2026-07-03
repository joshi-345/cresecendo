"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Play, Heart, ExternalLink, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface GemItem {
  title: string;
  artist: string;
  reason: string;
  confidence: number;
}

const coverGradients = [
  "from-brand-500 to-violet-700",
  "from-accent-cyan to-teal-700",
  "from-accent-pink to-rose-700",
  "from-accent-amber to-orange-700",
  "from-sky-500 to-blue-700",
  "from-emerald-500 to-green-700",
];

const genreFilters = ["All Genres", "Pop", "R&B", "Electronic", "Hip Hop", "Indie"];

export default function HiddenGemsPage() {
  const [gems, setGems] = useState<GemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    async function fetchGems() {
      setIsLoading(true);
      try {
        const res = await apiGet<any>("/recommendations");
        setGems(res.recommendations || []);
      } catch (err) {
        console.error("Failed to load hidden gems:", err);
        addToast("Failed to load hidden gems.", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchGems();
  }, [addToast]);

  const filtered = useMemo(() => {
    if (activeGenre === "All Genres") return gems;
    return gems.filter((g) =>
      g.reason.toLowerCase().includes(activeGenre.toLowerCase())
    );
  }, [gems, activeGenre]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent-cyan/10 p-2.5">
          <Sparkles className="h-6 w-6 text-accent-cyan" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Hidden Gems Vault</h1>
          <p className="text-gray-400">AI-discovered underrated songs with explosive growth potential</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {genreFilters.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              genre === activeGenre
                ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                : "border-surface-border text-gray-400 hover:border-brand-500/30 hover:text-white"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Gems Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse overflow-hidden">
              <div className="h-48 bg-surface-border" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-32 rounded bg-surface-border" />
                <div className="h-3 w-20 rounded bg-surface-border" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No hidden gems found for this filter.</p>
          <button
            onClick={() => setActiveGenre("All Genres")}
            className="mt-4 text-sm text-brand-400 hover:text-brand-300"
          >
            Show all gems
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gem, i) => {
            const gradient = coverGradients[i % coverGradients.length];
            return (
              <motion.div
                key={`${gem.title}-${gem.artist}`}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
                className="glass-card group overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow"
              >
                {/* Cover Art */}
                <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 text-white" fill="white" />
                    </button>
                  </div>
                  {/* Discovery Score Badge */}
                  <div className="absolute right-3 top-3 rounded-lg bg-black/40 px-2.5 py-1 backdrop-blur-md">
                    <span className="text-xs font-bold text-accent-cyan">
                      {gem.confidence}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{gem.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{gem.artist}</p>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500">{gem.reason}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4">
                    <div className="flex items-center gap-1 text-accent-cyan">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-bold">{gem.confidence}% match</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-accent-pink">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
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
