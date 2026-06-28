import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Song, PredictionResult } from "@/types/models";

// ===== Auth Store =====
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => {
        localStorage.setItem("crescendo_token", token);
        if (typeof window !== "undefined") {
          document.cookie = `crescendo_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("crescendo_token");
        if (typeof window !== "undefined") {
          document.cookie = "crescendo_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "crescendo-auth" }
  )
);

// ===== Dashboard Store =====
interface DashboardState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ===== Prediction Store =====
interface PredictionState {
  currentSong: Song | null;
  result: PredictionResult | null;
  isLoading: boolean;
  setCurrentSong: (song: Song) => void;
  setResult: (result: PredictionResult) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const usePredictionStore = create<PredictionState>()((set) => ({
  currentSong: null,
  result: null,
  isLoading: false,
  setCurrentSong: (song) => set({ currentSong: song }),
  setResult: (result) => set({ result, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ currentSong: null, result: null, isLoading: false }),
}));
