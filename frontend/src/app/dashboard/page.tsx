"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Gauge,
  Music,
  Share2,
  TrendingDown,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const kpiShells = [
  {
    label: "Songs Analyzed",
    value: "24,891",
    change: "+12.5%",
    trend: "up" as const,
    icon: Music,
  },
  {
    label: "Active Artists",
    value: "3,247",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Predictions Made",
    value: "",
    change: "+100%",
    trend: "up" as const,
    icon: Wand2,
  },
  {
    label: "Prediction Accuracy",
    value: "94.7%",
    change: "-0.3%",
    trend: "down" as const,
    icon: Gauge,
  },
];

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await apiGet<any>("/predictions", { limit: 5 });
        setPredictions(response.items || []);
        setTotalPredictions(response.total || 0);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const dynamicKpis = kpiShells.map((kpi) => (
    kpi.label === "Predictions Made"
      ? { ...kpi, value: isLoading ? "..." : totalPredictions.toLocaleString(), change: totalPredictions > 0 ? "+100%" : "0%" }
      : kpi
  ));

  return (
    <div className="space-y-8">
      <motion.header initial="hidden" animate="visible" variants={fadeUp} custom={0} className="overflow-hidden rounded-2xl border border-[#2d2d2d] bg-[#0f0f0f] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="studio-eyebrow">Dashboard</div>
            <h1 className="studio-heading mt-4 text-4xl md:text-6xl">
              Your release radar is live.
            </h1>
            <p className="studio-body mt-4 max-w-2xl text-lg">
              Track predictions, spot rising genres, and turn model output into release decisions your team can act on.
            </p>
          </div>

          <div className="rounded-xl score-gradient p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Latest confidence</div>
            <div className="mt-3 flex items-end gap-2">
              <span className="score-count font-mono text-6xl font-black text-white">87</span>
              <span className="mb-2 text-xl font-black text-white">/100</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[87%] rounded-full bg-white" />
            </div>
          </div>
        </div>
      </motion.header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicKpis.map((kpi, i) => (
          <motion.article
            key={kpi.label}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={i + 1}
            className="studio-surface p-5 transition duration-200 hover:-translate-y-1 hover:border-[#ff6b35]/45"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ff6b35]/15 text-[#ff6b35]">
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${kpi.trend === "up" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                {kpi.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-5">
              <div className="score-count font-mono text-3xl font-black text-white">{kpi.value}</div>
              <div className="mt-1 text-sm text-[#9ca3af]">{kpi.label}</div>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-7">
        <motion.article
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="studio-surface p-6 lg:col-span-4"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="studio-eyebrow">Prediction Trends</div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">Last 30 days</h2>
            </div>
            <button className="studio-button-ghost">
              View All <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <AreaChartComponent />
        </motion.article>

        <motion.article
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
          className="studio-surface p-6 lg:col-span-3"
        >
          <div className="mb-6">
            <div className="studio-eyebrow">Genre Distribution</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">Top performing genres</h2>
          </div>
          <BarChartComponent />
        </motion.article>
      </section>

      <motion.article
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={7}
        className="studio-surface p-6"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[#ff6b35]" />
            <div>
              <div className="studio-eyebrow">Recent Predictions</div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">Fresh model reads</h2>
            </div>
          </div>
          <Link href="/dashboard/prediction-lab" className="studio-button-primary min-h-10 px-4 py-2">
            New Prediction
            <Zap className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] py-10 text-center text-[#9ca3af]">
              Loading predictions...
            </div>
          ) : predictions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3a3a3a] bg-[#0f0f0f] px-6 py-12 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-[#ff6b35]" />
              <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">No predictions yet.</h3>
              <p className="studio-body mx-auto mt-2 max-w-md">
                Run your first song through the Prediction Lab and watch the score reveal here.
              </p>
              <Link href="/dashboard/prediction-lab" className="studio-button-primary mt-6">
                Run First Analysis
              </Link>
            </div>
          ) : (
            predictions.map((item) => (
              <div
                key={item.prediction_id}
                className="flex flex-col gap-3 rounded-xl border border-[#2d2d2d] bg-[#0f0f0f] px-4 py-3 transition hover:border-[#ff6b35]/45 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ff6b35]/15">
                    <Music className="h-5 w-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Viral prediction completed</p>
                    <p className="text-xs text-[#9ca3af]">
                      {item.artist_name && item.song_title
                        ? `${item.artist_name} - ${item.song_title}`
                        : "Unknown Artist - Unknown Track"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[#10b981]/15 px-2 py-1 text-xs font-bold text-[#10b981]">
                    Score: {item.prediction?.viral_score}%
                  </span>
                  <button className="studio-button-ghost min-h-9 px-3 py-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.article>
    </div>
  );
}
