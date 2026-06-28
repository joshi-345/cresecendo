import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Crescendo Brand Palette ---
        brand: {
          50: "#f0f0ff",
          100: "#e0e0ff",
          200: "#c7c4ff",
          300: "#a5a0ff",
          400: "#8b7fff",
          500: "#7c5cfc", // Primary
          600: "#6d3ef2",
          700: "#5e30d6",
          800: "#4d28ae",
          900: "#3f2389",
          950: "#261454",
        },
        accent: {
          cyan: "#06d6a0",
          pink: "#ff006e",
          amber: "#ffbe0b",
          coral: "#ff6b6b",
        },
        surface: {
          DEFAULT: "#0a0a0f",
          card: "#12121a",
          elevated: "#1a1a2e",
          border: "#2a2a3e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #7c5cfc 0%, #06d6a0 50%, #ff006e 100%)",
        "gradient-dark": "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 92, 252, 0.3)",
        "glow-lg": "0 0 40px rgba(124, 92, 252, 0.4)",
        "glow-cyan": "0 0 20px rgba(6, 214, 160, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 92, 252, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 92, 252, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
