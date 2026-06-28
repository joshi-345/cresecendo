"use client";

import Link from "next/link";
import { Music2 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#2d2d2d] bg-[#0f0f0f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6b35] text-white shadow-[0_12px_28px_rgba(255,107,53,0.22)]">
            <Music2 className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-black tracking-[-0.04em] text-[#f0f0f0]">
            Crescendo
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Dashboard", href: "/dashboard" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="min-h-11 content-center text-sm font-semibold text-[#9ca3af] transition-colors hover:text-[#f0f0f0]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="studio-button-ghost hidden sm:inline-flex">
            Sign In
          </Link>
          <Link href="/signup" className="studio-button-primary min-h-10 px-4 py-2">
            Try Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
