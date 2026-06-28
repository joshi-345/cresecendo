"use client";

import { motion } from "framer-motion";
import { Waveform, Music } from "lucide-react";
import { RadarChartComponent } from "@/components/charts/radar-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";

const audioFeatures = [
  { name: "Danceability", value: 82, color: "#7c5cfc" },
  { name: "Energy", value: 74, color: "#ff006e" },
  { name: "Acousticness", value: 23, color: "#06d6a0" },
  { name: "Instrumentalness", value: 8, color: "#ffbe0b" },
  { name: "Valence", value: 65, color: "#ff6b6b" },
  { name: "Speechiness", value: 12, color: "#3a86ff" },
  { name: "Liveness", value: 18, color: "#8338ec" },
];

const songDetails = {
  title: "Midnight Drive",
  artist: "Luna Ray",
  album: "Neon Horizons",
  tempo: 128,
  key: "C# Minor",
  duration: "3:42",
  timeSignature: "4/4",
  loudness: -5.2,
};

export default function AudioIntelligencePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-sky-500/10 p-2.5">
          <Waveform className="h-6 w-6 text-sky-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Audio Intelligence</h1>
          <p className="text-gray-400">Deep audio feature analysis and music fingerprinting</p>
        </div>
      </div>

      {/* Song Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-700">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{songDetails.title}</h2>
            <p className="text-gray-400">{songDetails.artist} · {songDetails.album}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Tempo", value: `${songDetails.tempo} BPM` },
            { label: "Key", value: songDetails.key },
            { label: "Duration", value: songDetails.duration },
            { label: "Loudness", value: `${songDetails.loudness} dB` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-surface-border bg-surface-elevated p-3 text-center">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Audio Feature Radar</h3>
          <RadarChartComponent />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Feature Breakdown</h3>
          <div className="space-y-4">
            {audioFeatures.map((feature) => (
              <div key={feature.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-300">{feature.name}</span>
                  <span className="font-medium text-white">{feature.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: feature.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Genre Comparison</h3>
        <p className="mb-6 text-sm text-gray-400">How this song compares to genre averages</p>
        <BarChartComponent />
      </motion.div>
    </div>
  );
}
