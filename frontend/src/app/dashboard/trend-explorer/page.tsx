"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Globe, Calendar } from "lucide-react";
import { AreaChartComponent } from "@/components/charts/area-chart";

const trendingGenres = [
  { name: "Afrobeats", direction: "up", change: "+34.2%", listeners: "89M", color: "text-accent-cyan" },
  { name: "Hyperpop", direction: "up", change: "+28.7%", listeners: "12M", color: "text-accent-cyan" },
  { name: "Latin Pop", direction: "up", change: "+22.1%", listeners: "156M", color: "text-accent-cyan" },
  { name: "Lo-fi", direction: "down", change: "-5.3%", listeners: "45M", color: "text-accent-coral" },
  { name: "Classic Rock", direction: "down", change: "-8.1%", listeners: "78M", color: "text-accent-coral" },
  { name: "K-Pop", direction: "up", change: "+18.4%", listeners: "198M", color: "text-accent-cyan" },
  { name: "Neo-Soul", direction: "up", change: "+41.6%", listeners: "23M", color: "text-accent-cyan" },
  { name: "Drill", direction: "down", change: "-12.7%", listeners: "34M", color: "text-accent-coral" },
];

export default function TrendExplorerPage() {
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
          <select className="bg-transparent text-sm text-gray-300 outline-none">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <select className="bg-transparent text-sm text-gray-300 outline-none">
            <option>Global</option>
            <option>North America</option>
            <option>Europe</option>
            <option>Asia Pacific</option>
            <option>Latin America</option>
            <option>Africa</option>
          </select>
        </div>
      </div>

      {/* Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">Genre Popularity Timeline</h3>
        <p className="mb-6 text-sm text-gray-400">Relative interest over time across streaming platforms</p>
        <AreaChartComponent />
      </motion.div>

      {/* Genre Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Genre Movement</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingGenres.map((genre, i) => (
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
                  <TrendingUp className={`h-5 w-5 ${genre.color}`} />
                ) : (
                  <TrendingDown className={`h-5 w-5 ${genre.color}`} />
                )}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Monthly Listeners</p>
                  <p className="text-sm font-medium text-white">{genre.listeners}</p>
                </div>
                <span className={`text-sm font-bold ${genre.color}`}>{genre.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
