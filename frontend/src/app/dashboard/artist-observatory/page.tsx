"use client";

import { motion } from "framer-motion";
import { Eye, TrendingUp, Users, Music, BarChart3, ArrowUpRight } from "lucide-react";
import { LineChartComponent } from "@/components/charts/line-chart";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const artists = [
  { name: "Luna Ray", genre: "Dream Pop", followers: "2.4M", monthlyListeners: "890K", growth: "+15.3%", popularity: 78, gradient: "from-brand-500 to-violet-700" },
  { name: "Echo Waves", genre: "Chillwave", followers: "156K", monthlyListeners: "67K", growth: "+142%", popularity: 54, gradient: "from-accent-cyan to-teal-700" },
  { name: "The Drift", genre: "Indie R&B", followers: "1.1M", monthlyListeners: "430K", growth: "+8.7%", popularity: 72, gradient: "from-accent-pink to-rose-700" },
  { name: "Aria Moon", genre: "Alt Pop", followers: "3.8M", monthlyListeners: "1.5M", growth: "+5.2%", popularity: 85, gradient: "from-accent-amber to-orange-700" },
];

export default function ArtistObservatoryPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2.5">
          <Eye className="h-6 w-6 text-violet-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Artist Observatory</h1>
          <p className="text-gray-400">Track artist growth trajectories and discover rising stars</p>
        </div>
      </div>

      {/* Growth Chart */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Growth Trajectories</h3>
            <p className="text-sm text-gray-400">Monthly listener trends — last 6 months</p>
          </div>
          <div className="flex gap-2">
            {["1M", "3M", "6M", "1Y"].map((period) => (
              <button key={period} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${period === "6M" ? "bg-brand-500/10 text-brand-400" : "text-gray-500 hover:text-gray-300"}`}>
                {period}
              </button>
            ))}
          </div>
        </div>
        <LineChartComponent />
      </motion.div>

      {/* Artist Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {artists.map((artist, i) => (
          <motion.div key={artist.name} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1} className="glass-card overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow">
            <div className={`h-24 bg-gradient-to-r ${artist.gradient}`} />
            <div className="-mt-8 px-6 pb-6">
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${artist.gradient} text-2xl font-bold text-white shadow-lg`}>
                {artist.name.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-white">{artist.name}</h3>
              <p className="text-sm text-gray-400">{artist.genre}</p>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Users className="h-3 w-3" /> Followers</div>
                  <p className="mt-1 text-sm font-semibold text-white">{artist.followers}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Music className="h-3 w-3" /> Monthly</div>
                  <p className="mt-1 text-sm font-semibold text-white">{artist.monthlyListeners}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><TrendingUp className="h-3 w-3" /> Growth</div>
                  <p className="mt-1 text-sm font-semibold text-accent-cyan">{artist.growth}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-surface-border pt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-500">Popularity Index</span>
                  <span className="text-white">{artist.popularity}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-border">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan" style={{ width: `${artist.popularity}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
