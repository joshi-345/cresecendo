"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await apiPost("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setErrorMsg(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card p-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-sm text-gray-400">
            If <span className="font-medium text-white">{email}</span> is registered, you&apos;ll receive a password reset link shortly.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Don&apos;t see it? Check your spam folder.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    );
  }

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
            <Mail className="h-8 w-8 text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
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
                <Mail className="h-5 w-5" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
