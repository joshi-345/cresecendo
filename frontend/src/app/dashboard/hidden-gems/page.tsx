"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Play, Heart, ExternalLink } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

// --- Mock Data ---
const hiddenGems = [
  { id: 1, title: "Echoes of Dawn", artist: "Luna Ray", genre: "Dream Pop", streams: "12.4K", growth: "+340%", discoveryScore: 94, coverColor: "from-brand-500 to-violet-700" },
  { id: 2, title: "Neon Pulse", artist: "Synthwave Collective", genre: "Synthwave", streams: "8.7K", growth: "+520%", discoveryScore: 91, coverColor: "from-accent-cyan to-teal-700" },
  { id: 3, title: "Velvet Midnight", artist: "The Drift", genre: "Indie R&B", streams: "15.2K", growth: "+180%", discoveryScore: 88, coverColor: "from-accent-pink to-rose-700" },
  { id: 4, title: "Crystal Waves", artist: "Echo Waves", genre: "Chillwave", streams: "6.3K", growth: "+670%", discoveryScore: 96, coverColor: "from-accent-amber to-orange-700" },
  { id: 5, title: "Stargazer", artist: "Aria Moon", genre: "Alt Pop", streams: "20.1K", growth: "+150%", discoveryScore: 85, coverColor: "from-sky-500 to-blue-700" },
  { id: 6, title: "Desert Rain", artist: "Sahara Sound", genre: "World Electronic", streams: "4.8K", growth: "+890%", discoveryScore: 97, coverColor: "from-emerald-500 to-green-700" },
];

export default function HiddenGemsPage() {
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
        {["All Genres", "Pop", "R&B", "Electronic", "Hip Hop", "Indie"].map((genre) => (
          <button
            key={genre}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              genre === "All Genres"
                ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                : "border-surface-border text-gray-400 hover:border-brand-500/30 hover:text-white"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Gems Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hiddenGems.map((gem, i) => (
          <motion.div
            key={gem.id}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={i}
            className="glass-card group overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow"
          >
            {/* Cover Art Placeholder */}
            <div className={`relative h-48 bg-gradient-to-br ${gem.coverColor}`}>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 text-white" fill="white" />
                </button>
              </div>
              {/* Discovery Score Badge */}
              <div className="absolute right-3 top-3 rounded-lg bg-black/40 px-2.5 py-1 backdrop-blur-md">
                <span className="text-xs font-bold text-accent-cyan">
                  {gem.discoveryScore}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white">{gem.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{gem.artist}</p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Streams</span>
                  <p className="text-sm font-medium text-white">{gem.streams}</p>
                </div>
                <div className="flex items-center gap-1 text-accent-cyan">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-bold">{gem.growth}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4">
                <span className="rounded-lg bg-surface-elevated px-2.5 py-1 text-xs text-gray-400">
                  {gem.genre}
                </span>
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
        ))}
      </div>
    </div>
  );
}
