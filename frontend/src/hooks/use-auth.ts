"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import type { LoginInput, SignupInput } from "@/lib/validators";
import type { AuthResponse } from "@/types/api";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: clearAuth } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginInput) => {
      const { data } = await api.post<AuthResponse>("/auth/login", credentials);
      setUser(data.user, data.access_token);
      router.push("/dashboard");
      return data;
    },
    [setUser, router]
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const { data } = await api.post<AuthResponse>("/auth/register", input);
      setUser(data.user, data.access_token);
      router.push("/dashboard");
      return data;
    },
    [setUser, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  return { user, isAuthenticated, login, signup, logout };
}
