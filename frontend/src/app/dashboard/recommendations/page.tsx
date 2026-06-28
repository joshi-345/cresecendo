"use client";

import { motion } from "framer-motion";
import { Lightbulb, Play, Heart, Plus, Shuffle } from "lucide-react";

const recommendations = [
  { title: "Midnight Drive", artist: "Luna Ray", reason: "Based on your viral predictions", confidence: 94, gradient: "from-brand-500 to-violet-700" },
  { title: "Ocean Floor", artist: "Deep Current", reason: "Trending in your preferred genres", confidence: 89, gradient: "from-accent-cyan to-teal-700" },
  { title: "Golden Hour", artist: "Aria Moon", reason: "High emotional match", confidence: 91, gradient: "from-accent-amber to-orange-700" },
  { title: "Static Dreams", artist: "Neon Collective", reason: "Similar audio fingerprint", confidence: 86, gradient: "from-accent-pink to-rose-700" },
  { title: "Sunrise Protocol", artist: "Morning Algorithm", reason: "Rising in your market segment", confidence: 92, gradient: "from-emerald-500 to-green-700" },
  { title: "Glass Towers", artist: "Urban Void", reason: "Audience overlap detected", confidence: 88, gradient: "from-sky-500 to-blue-700" },
  { title: "Phantom Waves", artist: "Ghost Signal", reason: "Predicted breakout track", confidence: 95, gradient: "from-purple-500 to-indigo-700" },
  { title: "Desert Bloom", artist: "Sahara Sound", reason: "Emerging artist match", confidence: 90, gradient: "from-rose-500 to-pink-700" },
];

export default function RecommendationsPage() {
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
        <button className="btn-glow flex items-center gap-2">
          <Shuffle className="h-5 w-5" /> Refresh
        </button>
      </div>

      {/* Recommendation Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="glass-card group overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow"
          >
            <div className={`relative h-40 bg-gradient-to-br ${rec.gradient}`}>
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
                <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-accent-pink"><Heart className="h-4 w-4" /></button>
                <button className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-accent-cyan"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
