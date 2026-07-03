"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { apiPost } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setErrorMsg("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, password });
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("Reset password failed:", err);
      setErrorMsg(err.response?.data?.detail || "Reset failed. The token may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <h1 className="font-display text-2xl font-bold text-white">Password Reset!</h1>
          <p className="mt-3 text-sm text-gray-400">
            Your password has been updated. Redirecting to login...
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            Go to Sign In →
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
            <Lock className="h-8 w-8 text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Create new password
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter a new password for your account
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
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-border bg-surface-elevated px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
              minLength={8}
            />
          </div>

          {/* Password strength hint */}
          <div className="text-xs text-gray-500">
            Must be at least 8 characters
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
                <Lock className="h-5 w-5" />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Back to{" "}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="glass-card flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
