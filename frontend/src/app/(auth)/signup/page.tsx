"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, Music } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apiPost } from "@/lib/api";
import type { AuthResponse } from "@/types/api";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("artist");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await apiPost<AuthResponse>("/auth/register", {
        name,
        email,
        password,
        role,
      });

      setUser(response.user, response.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup failed:", err);
      const detail = err.response?.data?.detail || "Registration failed. Please try again.";
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: "artist", label: "Artist" },
    { value: "label", label: "Record Label" },
    { value: "producer", label: "Producer" },
    { value: "marketer", label: "Marketing" },
    { value: "other", label: "Other" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-brand-500/10 p-3">
            <Music className="h-8 w-8 text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Join Crescendo and predict the future of music
          </p>
        </div>

        {/* Form */}
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-role" className="mb-1.5 block text-sm font-medium text-gray-300">
              I am a...
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
