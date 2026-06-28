// ===== Route Constants =====
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PREDICTION_LAB: "/dashboard/prediction-lab",
  HIDDEN_GEMS: "/dashboard/hidden-gems",
  ARTIST_OBSERVATORY: "/dashboard/artist-observatory",
  EMOTION_CANVAS: "/dashboard/emotion-canvas",
  TREND_EXPLORER: "/dashboard/trend-explorer",
  RECOMMENDATIONS: "/dashboard/recommendations",
  AUDIO_INTELLIGENCE: "/dashboard/audio-intelligence",
  SETTINGS: "/dashboard/settings",
} as const;

// ===== API Endpoints =====
export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  SONGS: {
    BASE: "/songs",
    SEARCH: "/songs/search",
    DETAIL: (id: string) => `/songs/${id}`,
  },
  ARTISTS: {
    BASE: "/artists",
    DETAIL: (id: string) => `/artists/${id}`,
    GROWTH: (id: string) => `/artists/${id}/growth`,
  },
  PREDICTIONS: {
    BASE: "/predictions",
    ANALYZE: "/predictions/analyze",
    DETAIL: (id: string) => `/predictions/${id}`,
  },
  EMOTIONS: {
    ANALYZE: "/emotions/analyze",
    DETAIL: (id: string) => `/emotions/${id}`,
  },
  TRENDS: {
    GENRES: "/trends/genres",
    TIMELINE: "/trends/timeline",
  },
  RECOMMENDATIONS: {
    BASE: "/recommendations",
    REFRESH: "/recommendations/refresh",
  },
} as const;

// ===== App Config =====
export const APP_CONFIG = {
  NAME: "Crescendo",
  TAGLINE: "Predict Tomorrow's Music Before the World Hears It",
  MAX_FILE_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_AUDIO_FORMATS: [".mp3", ".wav", ".flac", ".m4a", ".ogg"],
  PAGINATION_DEFAULT_LIMIT: 20,
  DEBOUNCE_MS: 300,
} as const;
