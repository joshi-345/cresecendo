"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Key, Bell, Palette, Shield, Save, CreditCard } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiGet, apiPost } from "@/lib/api";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile");
  const [predictionsUsed, setPredictionsUsed] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    async function fetchQuotaUsage() {
      try {
        const res = await apiGet<any>("/predictions", { limit: 1 });
        setPredictionsUsed(res.total || 0);
      } catch (err) {
        console.error("Failed to fetch quota usage:", err);
      }
    }
    fetchQuotaUsage();
  }, []);

  const handleSubscriptionAction = async (tier: "pro" | "studio") => {
    setIsRedirecting(true);
    try {
      const currentTier = user?.subscription_tier || user?.subscriptionTier || "free";
      
      if (currentTier === tier) {
        // Manage current subscription
        const res = await apiPost<any>("/billing/portal");
        if (res.url) {
          window.location.href = res.url;
        }
      } else {
        // Upgrade / Change subscription checkout
        const res = await apiPost<any>("/billing/checkout", { tier });
        if (res.url) {
          window.location.href = res.url;
        }
      }
    } catch (err) {
      console.error("Billing operation failed:", err);
      alert("Billing request failed. Please try again later.");
    } finally {
      setIsRedirecting(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gray-500/10 p-2.5">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 lg:col-span-3"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Email</label>
                  <input type="email" defaultValue="john@example.com" className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Role</label>
                  <select className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500">
                    <option>Artist</option>
                    <option>Record Label</option>
                    <option>Producer</option>
                    <option>Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Time Zone</label>
                  <select className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500">
                    <option>UTC-5 (EST)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+5:30 (IST)</option>
                  </select>
                </div>
              </div>
              <button className="btn-glow flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Billing & Plans</h3>
                <p className="text-sm text-gray-400">Manage your subscription, plans, and usage limits</p>
              </div>

              {/* Usage Quota display */}
              <div className="rounded-xl border border-surface-border p-5 bg-surface-elevated/20">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm font-medium text-white">Predictions Used This Month</p>
                    <p className="text-xs text-gray-500">Resets on the 1st of the month</p>
                  </div>
                  <span className="text-lg font-semibold text-brand-400">
                    {(user?.subscription_tier || user?.subscriptionTier) === "studio"
                      ? "Unlimited"
                      : `${predictionsUsed} / ${(user?.subscription_tier || user?.subscriptionTier) === "pro" ? 50 : 3}`}
                  </span>
                </div>
                {(user?.subscription_tier || user?.subscriptionTier) !== "studio" && (
                  <div className="h-2 w-full rounded-full bg-surface-border overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (predictionsUsed / ((user?.subscription_tier || user?.subscriptionTier) === "pro" ? 50 : 3)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Plan selection cards */}
              <div className="grid gap-6 md:grid-cols-3 pt-4">
                {/* Free Plan */}
                <div className={`rounded-xl border p-5 bg-surface-elevated/10 flex flex-col justify-between transition-all hover:border-brand-500/20 ${
                  (!user?.subscription_tier || user?.subscription_tier === "free")
                    ? "border-brand-500/50 ring-1 ring-brand-500/30"
                    : "border-surface-border"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-semibold text-white">Free Plan</h4>
                      {(!user?.subscription_tier || user?.subscription_tier === "free") && (
                        <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">$0</p>
                    <ul className="text-xs text-gray-400 space-y-2 mt-4">
                      <li>✓ 3 predictions / month</li>
                      <li>✓ Basic virality score</li>
                      <li>✓ Dynamic feature extraction</li>
                    </ul>
                  </div>
                  <button
                    disabled
                    className="mt-6 w-full rounded-lg bg-surface-border/50 py-2 text-xs font-medium text-gray-500 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all hover:border-brand-500/30 ${
                  (user?.subscription_tier || user?.subscriptionTier) === "pro"
                    ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/30"
                    : "border-surface-border bg-surface-elevated/10"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-semibold text-white">Pro Plan</h4>
                      {(user?.subscription_tier || user?.subscriptionTier) === "pro" && (
                        <span className="rounded bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">
                      $39<span className="text-xs font-normal text-gray-500">/mo</span>
                    </p>
                    <ul className="text-xs text-gray-400 space-y-2 mt-4">
                      <li>✓ 50 predictions / month</li>
                      <li>✓ Confidence intervals</li>
                      <li>✓ Priority processing</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSubscriptionAction("pro")}
                    disabled={isRedirecting}
                    className={`mt-6 w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                      (user?.subscription_tier || user?.subscriptionTier) === "pro"
                        ? "bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500/20"
                        : "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/10"
                    }`}
                  >
                    {isRedirecting
                      ? "Processing..."
                      : (user?.subscription_tier || user?.subscriptionTier) === "pro"
                      ? "Manage Billing"
                      : "Upgrade to Pro"}
                  </button>
                </div>

                {/* Studio Plan */}
                <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all hover:border-accent-pink/30 ${
                  (user?.subscription_tier || user?.subscriptionTier) === "studio"
                    ? "border-accent-pink bg-accent-pink/5 ring-1 ring-accent-pink/30"
                    : "border-surface-border bg-surface-elevated/10"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-semibold text-white">Studio Plan</h4>
                      {(user?.subscription_tier || user?.subscriptionTier) === "studio" && (
                        <span className="rounded bg-accent-pink/20 px-2 py-0.5 text-[10px] font-semibold text-accent-pink">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">
                      $199<span className="text-xs font-normal text-gray-500">/mo</span>
                    </p>
                    <ul className="text-xs text-gray-400 space-y-2 mt-4">
                      <li>✓ Unlimited predictions</li>
                      <li>✓ White-label dashboards</li>
                      <li>✓ API credentials (V1.1)</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSubscriptionAction("studio")}
                    disabled={isRedirecting}
                    className={`mt-6 w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                      (user?.subscription_tier || user?.subscriptionTier) === "studio"
                        ? "bg-accent-pink/10 text-accent-pink border border-accent-pink/30 hover:bg-accent-pink/20"
                        : "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/10"
                    }`}
                  >
                    {isRedirecting
                      ? "Processing..."
                      : (user?.subscription_tier || user?.subscriptionTier) === "studio"
                      ? "Manage Billing"
                      : "Upgrade to Studio"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">API Keys</h3>
              <p className="text-sm text-gray-400">Connect your streaming and social media accounts.</p>
              {["Spotify", "Genius", "YouTube", "Last.fm"].map((service) => (
                <div key={service} className="flex items-center justify-between rounded-xl border border-surface-border p-4">
                  <div>
                    <p className="font-medium text-white">{service} API</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                  <button className="rounded-lg border border-brand-500/30 px-4 py-2 text-sm text-brand-400 hover:bg-brand-500/10">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              {["Viral alerts", "Trend changes", "New hidden gems", "Weekly reports", "Artist milestones"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-surface-border p-4">
                  <span className="text-gray-300">{item}</span>
                  <button className="relative h-6 w-11 rounded-full bg-brand-500 transition-colors">
                    <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Appearance</h3>
              <div>
                <p className="mb-3 text-sm text-gray-400">Theme</p>
                <div className="flex gap-3">
                  {["Dark", "Light", "System"].map((theme) => (
                    <button key={theme} className={`rounded-xl border px-6 py-3 text-sm font-medium transition-all ${theme === "Dark" ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-surface-border text-gray-400 hover:border-brand-500/30"}`}>
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Security</h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Current Password</label>
                <input type="password" className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">New Password</label>
                <input type="password" className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none focus:border-brand-500" />
              </div>
              <button className="btn-glow flex items-center gap-2">
                <Shield className="h-4 w-4" /> Update Password
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
