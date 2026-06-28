"""
Crescendo — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, songs, artists, predictions, emotions, trends, recommendations, health, billing


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    # --- Startup ---
    print(f"Starting Crescendo v{settings.APP_VERSION}")
    # Load ML models
    from app.ml_integration.model_loader import model_manager
    model_manager.load_all()
    print(f"Loaded models: {model_manager.loaded_models}")
    yield
    # --- Shutdown ---
    print("Shutting down Crescendo")


app = FastAPI(
    title="Crescendo API",
    description="AI-Powered Music Intelligence Platform API",
    version=settings.APP_VERSION,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount Routers ---
API_PREFIX = "/api/v1"

app.include_router(health.router, prefix=API_PREFIX, tags=["Health"])
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"])
app.include_router(songs.router, prefix=f"{API_PREFIX}/songs", tags=["Songs"])
app.include_router(artists.router, prefix=f"{API_PREFIX}/artists", tags=["Artists"])
app.include_router(predictions.router, prefix=f"{API_PREFIX}/predictions", tags=["Predictions"])
app.include_router(billing.router, prefix=f"{API_PREFIX}/billing", tags=["Billing"])
app.include_router(emotions.router, prefix=f"{API_PREFIX}/emotions", tags=["Emotions"])
app.include_router(trends.router, prefix=f"{API_PREFIX}/trends", tags=["Trends"])
app.include_router(recommendations.router, prefix=f"{API_PREFIX}/recommendations", tags=["Recommendations"])
