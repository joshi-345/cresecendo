import Link from "next/link";
import { Music, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <Music className="mb-6 h-16 w-16 text-brand-500 opacity-50" />
      <h1 className="font-display text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-gray-400">
        This track doesn&apos;t exist in our library.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white transition-all hover:bg-brand-600 hover:shadow-glow"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
