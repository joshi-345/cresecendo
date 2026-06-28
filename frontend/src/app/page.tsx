"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CSSProperties, ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Disc3,
  Download,
  Gauge,
  LineChart,
  Play,
  Share2,
  Star,
  Wand2,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const waveformHeights = [38, 64, 28, 82, 48, 74, 92, 35, 58, 88, 42, 70, 96, 52, 76, 31, 61, 84];

const benefitBullets: Array<{ label: string; icon: ComponentType<{ className?: string }> }> = [
  { label: "AI predicts viral potential", icon: Wand2 },
  { label: "See your competition", icon: BarChart3 },
  { label: "Share predictions instantly", icon: Share2 },
];

function AnimatedScore({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [count, isInView, value]);

  return (
    <motion.span ref={ref} className="score-count font-mono text-7xl font-black tracking-[0.04em] text-white md:text-8xl">
      {rounded}
    </motion.span>
  );
}

const features = [
  {
    icon: Gauge,
    title: "Know Your Potential",
    description: "Upload a track signal and see a clear virality score, confidence band, and the exact drivers behind the result.",
  },
  {
    icon: LineChart,
    title: "Beat Your Competition",
    description: "Compare your sound against genre momentum, release timing, playlist movement, and artist trajectory patterns.",
  },
  {
    icon: Share2,
    title: "Go Viral Faster",
    description: "Turn insights into action with share-ready prediction cards, growth advice, and exportable reports for your team.",
  },
];

const testimonials = [
  {
    quote: "Predicted my song would spike. Two weeks later, it crossed 500k streams.",
    name: "Sofia Rodriguez",
    role: "Independent Artist",
  },
  {
    quote: "The confidence score helped me pick the right single instead of guessing.",
    name: "Malik Turner",
    role: "Producer",
  },
  {
    quote: "It feels like A&R radar for the speed independent artists actually move.",
    name: "Nadia Chen",
    role: "Label Scout",
  },
];

const pricing = [
  {
    tier: "Free",
    price: "$0",
    accent: "border-[#2d2d2d]",
    cta: "Start Free",
    features: ["3 predictions monthly", "Basic virality score", "Share one result card"],
  },
  {
    tier: "Pro",
    price: "$39",
    accent: "pricing-highlight",
    cta: "Choose Pro",
    badge: "Most Popular",
    features: ["50 predictions monthly", "Confidence intervals", "CSV export", "Priority model updates"],
  },
  {
    tier: "Studio",
    price: "$299",
    accent: "border-[#a23b72]",
    cta: "Talk to Sales",
    features: ["Unlimited batch scoring", "Team seats", "API access", "Scout dashboards"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f0f0f0] noise-bg">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-28 md:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="studio-eyebrow mb-5">
                AI virality predictions for creators
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="studio-heading text-balance text-5xl leading-[0.95] md:text-7xl lg:text-8xl"
              >
                Predict your next hit.
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="studio-body mt-6 max-w-2xl text-lg md:text-xl"
              >
                Know if your song can blow up before you release it. Crescendo turns audio, audience, and trend signals into a clear prediction in seconds.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/signup" className="studio-button-primary">
                  Start Predicting Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="#demo" className="studio-button-secondary">
                  <Play className="h-5 w-5" />
                  Watch 1-min demo
                </Link>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3"
              >
                {benefitBullets.map(({ label, icon: Icon }) => (
                  <div key={label} className="studio-surface-soft flex min-h-16 items-center gap-3 p-3">
                    <Icon className="h-5 w-5 flex-none text-[#ff6b35]" />
                    <span className="text-sm font-semibold text-[#f0f0f0]">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 48, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: -1 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="prediction-card"
              id="demo"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="studio-eyebrow">Prediction result</div>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white md:text-3xl">
                      "Midnight Archive"
                    </h2>
                    <p className="mt-1 text-sm text-[#9ca3af]">Nora Vael / Indie Electronic</p>
                  </div>
                  <span className="rounded-full bg-[#10b981] px-3 py-1 text-xs font-bold text-white">High</span>
                </div>

                <div className="mt-8 rounded-xl score-gradient p-6">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Virality score</div>
                  <div className="mt-4 flex items-end gap-2">
                    <AnimatedScore value={87} />
                    <span className="mb-3 text-2xl font-black text-white">/100</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "87%" }}
                      transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>

                <div className="mt-5 waveform">
                  {waveformHeights.map((height, index) => (
                    <span key={index} style={{ "--h": `${height}%` } as CSSProperties} />
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Confidence", "92%"],
                    ["Peak window", "2-4 weeks"],
                    ["Top driver", "Playlist lift"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</div>
                      <div className="mt-1 text-sm font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <div className="studio-eyebrow">Why artists use it</div>
              <h2 className="studio-heading mt-4 text-4xl md:text-5xl">Built for the moment before release.</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  custom={index}
                  className="studio-surface group p-6 transition duration-200 hover:-translate-y-1 hover:border-[#ff6b35]/50"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff6b35]/15 text-[#ff6b35]">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{feature.title}</h3>
                  <p className="studio-body mt-3">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="studio-eyebrow">Proof from creators</div>
                <h2 className="studio-heading mt-4 text-4xl md:text-5xl">The score should feel useful, not mysterious.</h2>
              </div>
              <div className="flex text-[#ff6b35]" aria-label="5 star rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <motion.article
                  key={item.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  custom={index}
                  className="studio-surface p-6"
                >
                  <p className="text-lg italic leading-8 text-[#f0f0f0]">"{item.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b35] text-sm font-black text-white">
                      {item.name.split(" ").map((part) => part[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-sm text-[#9ca3af]">{item.role}</div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="studio-eyebrow">Pricing</div>
              <h2 className="studio-heading mt-4 text-4xl md:text-5xl">Start free. Upgrade when the data starts paying for itself.</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {pricing.map((plan) => (
                <article
                  key={plan.tier}
                  className={`studio-surface relative p-6 ${plan.accent} ${plan.tier === "Pro" ? "lg:scale-[1.04]" : ""}`}
                >
                  {plan.badge && (
                    <div className="absolute right-5 top-5 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{plan.tier}</h3>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-5xl font-black tracking-[-0.06em] text-white">{plan.price}</span>
                    <span className="mb-2 text-[#9ca3af]">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-[#d1d5db]">
                        <Check className="h-5 w-5 flex-none text-[#10b981]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={plan.tier === "Pro" ? "studio-button-primary mt-8 w-full" : "studio-button-secondary mt-8 w-full"}>
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl rounded-2xl border border-[#ff6b35]/25 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-14">
            <Disc3 className="mx-auto h-12 w-12 text-[#ff6b35]" />
            <h2 className="studio-heading mx-auto mt-6 max-w-3xl text-4xl md:text-6xl">Ready to know your song's potential?</h2>
            <p className="studio-body mx-auto mt-5 max-w-2xl text-lg">
              Free predictions. No credit card needed. Get a useful signal before you spend another week guessing.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="studio-button-primary">
                Get Started Free
                <Zap className="h-5 w-5" />
              </Link>
              <Link href="/dashboard" className="studio-button-secondary">
                Open Demo Dashboard
                <Download className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
