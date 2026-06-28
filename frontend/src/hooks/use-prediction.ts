"use client";

import { useCallback, useState } from "react";
import { usePredictionStore } from "@/lib/store";
import api from "@/lib/api";
import { API } from "@/lib/constants";
import type { PredictionResponse } from "@/types/api";

export function usePrediction() {
  const { result, isLoading, setResult, setLoading, reset } = usePredictionStore();
  const [error, setError] = useState<string | null>(null);

  const analyzeSong = useCallback(
    async (input: { spotifyUrl?: string; songTitle?: string; artistName?: string }) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.post<PredictionResponse>(API.PREDICTIONS.ANALYZE, input);
        setResult(data.prediction);
        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Prediction failed";
        setError(message);
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setResult]
  );

  return { result, isLoading, error, analyzeSong, reset };
}
