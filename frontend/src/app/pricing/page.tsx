"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
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

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For artists exploring their first predictions",
    icon: Sparkles,
    accent: "border-[#2d2d2d]",
    ctaText: "Start Free",
    ctaStyle: "studio-button-secondary",
    features: [
      "3 predictions per month",
      "Basic virality score",
      "Dynamic feature extraction",
      "Share one result card",
      "Community support",
    ],
    limits: [
      "No confidence intervals",
      "No CSV export",
      "No priority processing",
    ],
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    description: "For serious creators who ship every month",
    icon: Zap,
    accent: "pricing-highlight",
    badge: "Most Popular",
    ctaText: "Choose Pro",
    ctaStyle: "studio-button-primary",
    features: [
      "50 predictions per month",
      "Confidence intervals & bands",
      "CSV export & reports",
      "Priority model updates",
      "Priority processing queue",
      "Email support (24h SLA)",
      "Prediction history & trends",
    ],
    limits: [
      "No API access",
      "No team seats",
    ],
  },
  {
    name: "Studio",
    price: "$199",
    period: "/month",
    description: "For labels, agencies, and power users",
    icon: Building2,
    accent: "border-[#a23b72]",
    ctaText: "Contact Sales",
    ctaStyle: "studio-button-secondary",
    features: [
      "Unlimited predictions",
      "Everything in Pro",
      "White-label dashboards",
      "API access (v1.1)",
      "Team seats (up to 10)",
      "Scout & A&R dashboards",
      "Dedicated account manager",
      "Custom model training",
      "SSO & audit logs",
    ],
    limits: [],
  },
];

const comparisonRows = [
  { feature: "Monthly Predictions", free: "3", pro: "50", studio: "Unlimited" },
  { feature: "Virality Score", free: "✓", pro: "✓", studio: "✓" },
  { feature: "Confidence Intervals", free: "—", pro: "✓", studio: "✓" },
  { feature: "Audio Feature Analysis", free: "✓", pro: "✓", studio: "✓" },
  { feature: "Emotion Analysis (NLP)", free: "—", pro: "✓", studio: "✓" },
  { feature: "CSV Export", free: "—", pro: "✓", studio: "✓" },
  { feature: "Priority Processing", free: "—", pro: "✓", studio: "✓" },
  { feature: "API Access", free: "—", pro: "—", studio: "✓" },
  { feature: "Team Seats", free: "1", pro: "1", studio: "Up to 10" },
  { feature: "White-label Dashboards", free: "—", pro: "—", studio: "✓" },
  { feature: "Custom Model Training", free: "—", pro: "—", studio: "✓" },
  { feature: "Support", free: "Community", pro: "Email (24h)", studio: "Dedicated" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f0f0f0] noise-bg">
      <Navbar />

      <main className="px-4 pb-20 pt-28 md:pt-36">
        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="studio-eyebrow">
            Simple, transparent pricing
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="studio-heading mt-4 text-4xl md:text-6xl lg:text-7xl"
          >
            Start free. Scale when you're ready.
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="studio-body mx-auto mt-6 max-w-2xl text-lg"
          >
            Every plan includes our core AI prediction engine. Upgrade for higher limits, deeper insights, and team collaboration.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={index + 3}
              className={`studio-surface relative flex flex-col p-6 ${plan.accent} ${
                plan.name === "Pro" ? "lg:scale-[1.04] z-10" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute right-5 top-5 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff6b35]/15 text-[#ff6b35]">
                <plan.icon className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-black tracking-[-0.04em] text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-[#9ca3af]">{plan.description}</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black tracking-[-0.06em] text-white">{plan.price}</span>
                <span className="mb-2 text-[#9ca3af]">{plan.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-[#d1d5db]">
                    <Check className="h-5 w-5 flex-none text-[#10b981]" />
                    {feature}
                  </li>
                ))}
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex gap-3 text-sm text-[#6b7280]">
                    <span className="flex h-5 w-5 flex-none items-center justify-center text-[#6b7280]">—</span>
                    {limit}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`${plan.ctaStyle} mt-8 w-full text-center`}
              >
                {plan.ctaText}
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-24 max-w-5xl"
        >
          <h2 className="studio-heading mb-10 text-center text-3xl md:text-4xl">
            Full feature comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#2d2d2d] bg-[#0f0f0f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d2d2d]">
                  <th className="px-6 py-4 text-left font-semibold text-[#9ca3af]">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Free</th>
                  <th className="px-6 py-4 text-center font-semibold text-[#ff6b35]">Pro</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Studio</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#2d2d2d]/50 ${i % 2 === 0 ? "bg-[#1a1a1a]/30" : ""}`}
                  >
                    <td className="px-6 py-3.5 text-[#d1d5db]">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center text-[#9ca3af]">{row.free}</td>
                    <td className="px-6 py-3.5 text-center text-white font-medium">{row.pro}</td>
                    <td className="px-6 py-3.5 text-center text-white font-medium">{row.studio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-24 max-w-3xl"
        >
          <h2 className="studio-heading mb-10 text-center text-3xl md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes. Upgrade or downgrade at any time from your Settings page. Upgrades take effect immediately; downgrades apply at the end of your billing cycle.",
              },
              {
                q: "What happens when I hit my prediction limit?",
                a: "You'll see a friendly prompt to upgrade. Your existing predictions and data remain accessible — you just can't create new ones until the limit resets on the 1st of the month.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Annual plans with a 20% discount are coming in Q3 2027. Sign up for Pro or Studio now and we'll honor the discount retroactively.",
              },
              {
                q: "Is there a free trial for Pro?",
                a: "The Free plan is your trial — use 3 predictions per month, no credit card required. When you're ready for more, upgrade to Pro.",
              },
              {
                q: "How does the Studio API access work?",
                a: "Studio plan members get API credentials to integrate Crescendo predictions into their own tools and workflows. Full API docs are available in the dashboard.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="studio-surface p-6">
                <h3 className="text-base font-bold text-white">{q}</h3>
                <p className="studio-body mt-3 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mx-auto mt-24 max-w-3xl text-center">
          <h2 className="studio-heading text-3xl md:text-5xl">
            Ready to predict your next hit?
          </h2>
          <p className="studio-body mx-auto mt-4 max-w-xl text-lg">
            Join thousands of artists and labels already using Crescendo to make smarter release decisions.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="studio-button-primary">
              Get Started Free
              <Zap className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
