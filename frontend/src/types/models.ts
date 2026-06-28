// ===== User =====
export interface User {
  id: string;
  name: string;
  email: string;
  role: "artist" | "label" | "producer" | "marketer" | "other";
  avatarUrl?: string;
  subscriptionTier?: "free" | "pro" | "studio";
  subscription_tier?: "free" | "pro" | "studio";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

// ===== Song =====
export interface Song {
  id: string;
  spotifyId?: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  releaseDate?: string;
  coverUrl?: string;
  audioFeatures?: AudioFeatures;
}

export interface AudioFeatures {
  tempo: number;
  key: string;
  timeSignature: string;
  duration: number;
  loudness: number;
  danceability: number;
  energy: number;
  acousticness: number;
  instrumentalness: number;
  valence: number;
  speechiness: number;
  liveness: number;
}

// ===== Artist =====
export interface Artist {
  id: string;
  spotifyId?: string;
  name: string;
  genres: string[];
  followers: number;
  monthlyListeners: number;
  popularity: number;
  imageUrl?: string;
}

// ===== Prediction =====
export interface PredictionResult {
  viralScore: number;
  successProbability: number;
  confidenceScore: number;
  growthForecast: string;
  modelVersion: string;
  topFactors: { name: string; impact: number }[];
}

// ===== Emotion =====
export interface EmotionResult {
  overallSentiment: string;
  emotions: { name: string; value: number; color: string }[];
  lyricAnalysis: {
    text: string;
    emotion: string;
    confidence: number;
  }[];
}

// ===== Trends =====
export interface TrendData {
  genre: string;
  direction: "up" | "down" | "stable";
  change: string;
  listeners: number;
  timeline: { date: string; value: number }[];
}
