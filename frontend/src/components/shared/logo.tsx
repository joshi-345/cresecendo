import { Music } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeMap = {
    sm: { container: "h-7 w-7", icon: "h-4 w-4", text: "text-lg" },
    md: { container: "h-9 w-9", icon: "h-5 w-5", text: "text-xl" },
    lg: { container: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
  };

  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex ${s.container} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan`}
      >
        <Music className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <span className={`font-display ${s.text} font-bold text-white`}>
          Crescendo
        </span>
      )}
    </div>
  );
}
