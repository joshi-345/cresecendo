"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Brain,
  Sparkles,
  TrendingUp,
  Palette,
  Eye,
  Lightbulb,
  Waveform,
  Settings,
  Music,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Prediction Lab", href: "/dashboard/prediction-lab", icon: Brain },
  { label: "Hidden Gems", href: "/dashboard/hidden-gems", icon: Sparkles },
  { label: "Artist Observatory", href: "/dashboard/artist-observatory", icon: Eye },
  { label: "Emotion Canvas", href: "/dashboard/emotion-canvas", icon: Palette },
  { label: "Trend Explorer", href: "/dashboard/trend-explorer", icon: TrendingUp },
  { label: "Recommendations", href: "/dashboard/recommendations", icon: Lightbulb },
  { label: "Audio Intelligence", href: "/dashboard/audio-intelligence", icon: Waveform },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-surface-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan">
          <Music className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-xl font-bold text-white">
          Crescendo
        </span>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          Modules
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-brand-500/10 text-brand-400 shadow-sm"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {isActive(item.href) && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-border px-3 py-4">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-brand-500/10 text-brand-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-surface-border bg-surface-card transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-surface-border bg-surface-card lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
