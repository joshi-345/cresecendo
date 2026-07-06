import type { User, Song, Artist, EmotionResult } from "./models";

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
export interface ApiViralScore {
  viral_score: number;
  success_probability: number;
  confidence_score: number;
  growth_forecast: string;
  model_version: string;
  top_factors: { name: string; impact: number }[];
}

export interface PredictionResponse {
  prediction_id: string;
  song_id: string;
  song_title?: string;
  artist_name?: string;
  prediction: ApiViralScore;
  predicted_genres: { genre: string; confidence: number }[];
  audio_features?: Partial<{
    danceability: number;
    energy: number;
    loudness: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    duration_ms: number;
  }>;
  processing_time_ms: number;
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
