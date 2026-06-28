import type { User, PredictionResult, Song, Artist, EmotionResult } from "./models";

// --- Generic API Wrapper ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// --- Paginated Response ---
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// --- Auth ---
export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// --- Prediction ---
export interface PredictionResponse {
  prediction: PredictionResult;
  song: Song;
  processingTimeMs: number;
}

// --- Emotion ---
export interface EmotionResponse {
  result: EmotionResult;
  song: Song;
}

// --- Artist ---
export interface ArtistGrowthResponse {
  artist: Artist;
  timeline: { date: string; listeners: number; followers: number }[];
}

// --- Errors ---
export interface ErrorResponse {
  detail: string;
  status_code: number;
}

// --- Health ---
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
}
