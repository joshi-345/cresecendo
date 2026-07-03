"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AudioWaveform, Music, Search, Loader2 } from "lucide-react";
import { RadarChartComponent } from "@/components/charts/radar-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { usePredictionStore } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

interface AudioFeature {
  name: string;
  value: number;
  color: string;
}

const featureColors: Record<string, string> = {
  danceability: "#7c5cfc",
  energy: "#ff006e",
  acousticness: "#06d6a0",
  instrumentalness: "#ffbe0b",
  valence: "#ff6b6b",
  speechiness: "#3a86ff",
  liveness: "#8338ec",
};

const defaultFeatures: AudioFeature[] = [
  { name: "Danceability", value: 82, color: "#7c5cfc" },
  { name: "Energy", value: 74, color: "#ff006e" },
  { name: "Acousticness", value: 23, color: "#06d6a0" },
  { name: "Instrumentalness", value: 8, color: "#ffbe0b" },
  { name: "Valence", value: 65, color: "#ff6b6b" },
  { name: "Speechiness", value: 12, color: "#3a86ff" },
  { name: "Liveness", value: 18, color: "#8338ec" },
];

export default function AudioIntelligencePage() {
  const predictionResult = usePredictionStore((s) => s.result);
  const currentSong = usePredictionStore((s) => s.currentSong);
  const [features, setFeatures] = useState<AudioFeature[]>(defaultFeatures);
  const [songInfo, setSongInfo] = useState({
    title: "Midnight Drive",
    artist: "Luna Ray",
    album: "Neon Horizons",
    tempo: 128,
    key: "C# Minor",
    duration: "3:42",
    loudness: -5.2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // If we have a prediction in the store, use its audio features
  useEffect(() => {
    if (currentSong?.audioFeatures) {
      const af = currentSong.audioFeatures;
      const mapped: AudioFeature[] = [
        { name: "Danceability", value: Math.round((af.danceability || 0) * 100), color: featureColors.danceability },
        { name: "Energy", value: Math.round((af.energy || 0) * 100), color: featureColors.energy },
        { name: "Acousticness", value: Math.round((af.acousticness || 0) * 100), color: featureColors.acousticness },
        { name: "Instrumentalness", value: Math.round((af.instrumentalness || 0) * 100), color: featureColors.instrumentalness },
        { name: "Valence", value: Math.round((af.valence || 0) * 100), color: featureColors.valence },
        { name: "Speechiness", value: Math.round((af.speechiness || 0) * 100), color: featureColors.speechiness },
        { name: "Liveness", value: Math.round((af.liveness || 0) * 100), color: featureColors.liveness },
      ];
      setFeatures(mapped);

      setSongInfo({
        title: currentSong.title || "Unknown",
        artist: currentSong.artist || "Unknown",
        album: currentSong.album || "Single",
        tempo: af.tempo || 120,
        key: af.key || "Unknown",
        duration: af.duration
          ? `${Math.floor(af.duration / 60)}:${(af.duration % 60).toString().padStart(2, "0")}`
          : "—",
        loudness: af.loudness || -6,
      });
    }
  }, [currentSong]);

  // Radar chart data
  const radarData = features.map((f) => ({
    subject: f.name,
    value: f.value,
  }));

  // Bar chart data for genre comparison
  const barData = features.map((f) => ({
    name: f.name.slice(0, 6),
    value: f.value,
    fill: f.color,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-sky-500/10 p-2.5">
          <AudioWaveform className="h-6 w-6 text-sky-400" />
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
            <h2 className="text-2xl font-bold text-white">{songInfo.title}</h2>
            <p className="text-gray-400">{songInfo.artist} · {songInfo.album}</p>
            {!currentSong && (
              <p className="mt-1 text-xs text-gray-500">
                Run a prediction in the <span className="text-brand-400">Prediction Lab</span> to see your song's audio features here.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Tempo", value: `${songInfo.tempo} BPM` },
            { label: "Key", value: songInfo.key },
            { label: "Duration", value: songInfo.duration },
            { label: "Loudness", value: `${songInfo.loudness} dB` },
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
          <RadarChartComponent data={radarData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Feature Breakdown</h3>
          <div className="space-y-4">
            {features.map((feature) => (
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
        <h3 className="mb-4 text-lg font-semibold text-white">Feature Comparison</h3>
        <p className="mb-6 text-sm text-gray-400">Audio feature values for the analyzed track</p>
        <BarChartComponent data={barData} />
      </motion.div>
    </div>
  );
}
