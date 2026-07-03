"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, TrendingUp, Users, Music, Loader2 } from "lucide-react";
import { LineChartComponent } from "@/components/charts/line-chart";
import { apiGet } from "@/lib/api";
import { useToastStore } from "@/components/ui/toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface ArtistData {
  id: string;
  name: string;
  genres: string[];
  followers: number;
  monthly_listeners: number;
  popularity: number;
  image_url?: string;
}

const gradients = [
  "from-brand-500 to-violet-700",
  "from-accent-cyan to-teal-700",
  "from-accent-pink to-rose-700",
  "from-accent-amber to-orange-700",
];

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export default function ArtistObservatoryPage() {
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("6M");
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    async function fetchArtists() {
      setIsLoading(true);
      try {
        const res = await apiGet<ArtistData[]>("/artists", { limit: 4, sort_by: "popularity" });
        setArtists(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load artists:", err);
        addToast("Failed to load artist data.", "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchArtists();
  }, [addToast]);

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
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  period === activePeriod ? "bg-brand-500/10 text-brand-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <LineChartComponent />
      </motion.div>

      {/* Artist Cards */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse overflow-hidden">
              <div className="h-24 bg-surface-border" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-32 rounded bg-surface-border" />
                <div className="h-3 w-20 rounded bg-surface-border" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {artists.map((artist, i) => {
            const gradient = gradients[i % gradients.length];
            return (
              <motion.div
                key={artist.id || artist.name}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 1}
                className="glass-card overflow-hidden transition-all duration-300 hover:border-brand-500/20 hover:shadow-glow"
              >
                <div className={`h-24 bg-gradient-to-r ${gradient}`} />
                <div className="-mt-8 px-6 pb-6">
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg`}>
                    {artist.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{artist.name}</h3>
                  <p className="text-sm text-gray-400">{artist.genres?.join(", ") || "Unknown Genre"}</p>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><Users className="h-3 w-3" /> Followers</div>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(artist.followers || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><Music className="h-3 w-3" /> Monthly</div>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(artist.monthly_listeners || 0)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><TrendingUp className="h-3 w-3" /> Popularity</div>
                      <p className="mt-1 text-sm font-semibold text-accent-cyan">{artist.popularity || 0}/100</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-surface-border pt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-500">Popularity Index</span>
                      <span className="text-white">{artist.popularity || 0}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-border">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan"
                        style={{ width: `${artist.popularity || 0}%` }}
                      />
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
