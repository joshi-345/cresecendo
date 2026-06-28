"""
Crescendo — Health Check Routes
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.db.database import async_session_factory

router = APIRouter()


@router.get("/health")
async def health_check():
    """Application health check."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.APP_ENV,
    }


@router.get("/health/ready")
async def readiness_check():
    """Readiness probe — checks all dependencies."""
    services = {}

    # Check PostgreSQL connection
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        services["postgres"] = "connected"
    except Exception as e:
        services["postgres"] = f"error: {str(e)[:100]}"

    # Check ML models loaded
    try:
        from app.ml_integration.model_loader import model_manager
        loaded = model_manager.loaded_models
        if loaded:
            services["ml_models"] = f"loaded ({', '.join(loaded)})"
        else:
            services["ml_models"] = "no models loaded"
    except Exception as e:
        services["ml_models"] = f"error: {str(e)[:100]}"

    all_healthy = (
        services.get("postgres") == "connected"
        and "loaded" in services.get("ml_models", "")
    )

    return {
        "status": "ready" if all_healthy else "not_ready",
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": services,
    }
