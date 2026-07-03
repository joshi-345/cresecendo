"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Globe, Calendar, Loader2 } from "lucide-react";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { apiGet } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

interface GenreTrend {
  name: string;
  direction: "up" | "down";
  change: string;
  listeners: number;
}

interface TimelinePoint {
  month: string;
  value: number;
}

const formatListeners = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export default function TrendExplorerPage() {
  const [period, setPeriod] = useState("30d");
  const [region, setRegion] = useState("global");
  const [genres, setGenres] = useState<GenreTrend[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useToastStore((s) => s.addToast);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [genreRes, timelineRes] = await Promise.all([
        apiGet<any>("/trends/genres", { period, region }),
        apiGet<any>("/trends/timeline", { period }),
      ]);
      setGenres(genreRes.genres || []);
      setTimeline(timelineRes.data || []);
    } catch (err) {
      console.error("Failed to load trends:", err);
      addToast("Failed to load trend data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [period, region, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform timeline data for the area chart
  const chartData = timeline.map((pt) => ({
    name: pt.month,
    popularity: pt.value,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent-pink/10 p-2.5">
          <TrendingUp className="h-6 w-6 text-accent-pink" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Trend Explorer</h1>
          <p className="text-gray-400">Track genre evolution and seasonal music trends</p>
        </div>
      </div>

      {/* Time Period & Region Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none"
          >
            <option value="global">Global</option>
            <option value="na">North America</option>
            <option value="eu">Europe</option>
            <option value="apac">Asia Pacific</option>
            <option value="latam">Latin America</option>
            <option value="africa">Africa</option>
          </select>
        </div>
      </div>

      {/* Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Genre Popularity Timeline</h3>
        <p className="mb-6 text-sm text-gray-400">Relative interest over time across streaming platforms</p>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <AreaChartComponent
            data={chartData}
            dataKeys={[{ key: "popularity", color: "#7c5cfc" }]}
          />
        )}
      </motion.div>

      {/* Genre Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Genre Movement</h3>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card animate-pulse p-4">
                <div className="h-4 w-24 rounded bg-surface-border" />
                <div className="mt-4 h-3 w-16 rounded bg-surface-border" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {genres.map((genre, i) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-card p-4 transition-all duration-300 hover:border-brand-500/20"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{genre.name}</h4>
                  {genre.direction === "up" ? (
                    <TrendingUp className="h-5 w-5 text-accent-cyan" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-accent-coral" />
                  )}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Monthly Listeners</p>
                    <p className="text-sm font-medium text-white">{formatListeners(genre.listeners)}</p>
                  </div>
                  <span className={`text-sm font-bold ${genre.direction === "up" ? "text-accent-cyan" : "text-accent-coral"}`}>
                    {genre.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
