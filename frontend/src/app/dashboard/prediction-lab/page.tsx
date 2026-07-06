"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Upload,
  Sparkles,
  TrendingUp,
  BarChart3,
  Music,
  Loader2,
  Tag,
} from "lucide-react";

import { apiPost } from "@/lib/api";
import { usePredictionStore } from "@/lib/store";
import { useToastStore } from "@/components/ui/toast";

interface PredictionResult {
  viralScore: number;
  successProbability: number;
  confidenceScore: number;
  growthForecast: string;
  modelVersion: string;
  topFactors: { name: string; impact: number }[];
  predictedGenres: { genre: string; confidence: number }[];
}

export default function PredictionLabPage() {
  const [inputType, setInputType] = useState<"url" | "details">("url");
  const [songUrl, setSongUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const predictionStore = usePredictionStore();
  const { addToast } = useToastStore();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg("");

    const payload: any = {};
    if (inputType === "url") {
      if (!songUrl.trim()) {
        setErrorMsg("Please enter a Spotify URL");
        setIsAnalyzing(false);
        return;
      }
      payload.spotify_url = songUrl;
    } else {
      if (!songTitle.trim() || !artistName.trim()) {
        setErrorMsg("Please enter both song title and artist name");
        setIsAnalyzing(false);
        return;
      }
      payload.song_title = songTitle;
      payload.artist_name = artistName;
    }

    try {
      const response = await apiPost<any>("/predictions/analyze", payload);
      const data = response.prediction;
      
      const predResult = {
        viralScore: data.viral_score,
        successProbability: data.success_probability,
        confidenceScore: data.confidence_score,
        growthForecast: data.growth_forecast,
        modelVersion: data.model_version,
        topFactors: data.top_factors || [],
        predictedGenres: response.predicted_genres || [],
      };
      setResult(predResult);

      // Push to PredictionStore so Audio Intelligence page can read it
      const audioFeatures = response.audio_features;
      predictionStore.setCurrentSong({
        id: response.song_id,
        title: response.song_title || songTitle,
        artist: response.artist_name || artistName,
        genre: response.predicted_genres?.[0]?.genre,
        audioFeatures: audioFeatures
          ? {
              tempo: audioFeatures.tempo || 120,
              key: "Unknown",
              timeSignature: "4/4",
              duration: Math.round((audioFeatures.duration_ms || 0) / 1000),
              loudness: audioFeatures.loudness || -6,
              danceability: audioFeatures.danceability || 0,
              energy: audioFeatures.energy || 0,
              acousticness: audioFeatures.acousticness || 0,
              instrumentalness: audioFeatures.instrumentalness || 0,
              valence: audioFeatures.valence || 0,
              speechiness: audioFeatures.speechiness || 0,
              liveness: audioFeatures.liveness || 0,
            }
          : undefined,
      });
      predictionStore.setResult(predResult);

      addToast(`Viral score: ${data.viral_score}% — ${data.growth_forecast}`, "success");
    } catch (err: any) {
      console.error("Prediction analysis failed:", err);
      const detail = err.response?.data?.detail || "Prediction failed. Please verify the URL or try again later.";
      setErrorMsg(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-500/10 p-2.5">
            <Brain className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Prediction Lab
            </h1>
            <p className="text-gray-400">
              AI-powered song virality prediction engine
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Analyze a Song
          </h2>
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-surface-elevated p-1 border border-surface-border">
            <button
              type="button"
              onClick={() => {
                setInputType("url");
                setErrorMsg("");
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                inputType === "url"
                  ? "bg-brand-500 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Spotify URL
            </button>
            <button
              type="button"
              onClick={() => {
                setInputType("details");
                setErrorMsg("");
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                inputType === "details"
                  ? "bg-brand-500 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Song Details
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex gap-4">
            {inputType === "url" ? (
              <div className="relative flex-1">
                <Music className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="Paste a Spotify URL (e.g. https://open.spotify.com/track/...)"
                  className="w-full rounded-xl border border-surface-border bg-surface-elevated py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500"
                />
              </div>
            ) : (
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1">
                  <Music className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Song Title"
                    className="w-full rounded-xl border border-surface-border bg-surface-elevated py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Artist Name"
                    className="w-full rounded-xl border border-surface-border bg-surface-elevated py-3 px-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing}
              className="btn-glow flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isAnalyzing ? "Analyzing..." : "Predict"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Viral Score */}
          <div className="glass-card flex flex-col items-center justify-center p-8">
            <div className="relative mb-4">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(124,92,252,0.1)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="url(#scoreGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.viralScore / 100) * 327} 327`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c5cfc" />
                    <stop offset="100%" stopColor="#06d6a0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold text-white">
                  {result.viralScore}
                </span>
                <span className="text-xs text-gray-400">Viral Score</span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              {result.growthForecast}
            </p>
            {result.predictedGenres.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {result.predictedGenres.map((g) => (
                  <span
                    key={g.genre}
                    className="flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-xs text-brand-300"
                  >
                    <Tag className="h-3 w-3" />
                    {g.genre} ({g.confidence}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="glass-card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-400">Success Probability</span>
                  <span className="font-medium text-white">
                    {(result.successProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-border">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan"
                    style={{ width: `${result.successProbability * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-400">Confidence Score</span>
                  <span className="font-medium text-white">
                    {(result.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-border">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent-amber to-accent-pink"
                    style={{ width: `${result.confidenceScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Factors */}
          <div className="glass-card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-white">
              Impact Factors
            </h3>
            <div className="space-y-3">
              {result.topFactors.map((factor) => (
                <div key={factor.name} className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-brand-400" />
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-300">{factor.name}</span>
                      <span className="text-gray-400">{factor.impact}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-border">
                      <div
                        className="h-1.5 rounded-full bg-brand-500"
                        style={{ width: `${factor.impact}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="mb-4 h-16 w-16 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-400">
            No Predictions Yet
          </h3>
          <p className="mt-2 max-w-md text-gray-500">
            Enter a Spotify URL or upload a song to get AI-powered viral
            predictions, success probability, and growth forecasts.
          </p>
        </div>
      )}
    </div>
  );
}
