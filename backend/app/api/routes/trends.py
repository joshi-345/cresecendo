"""
Crescendo — Trend Routes
"""

from fastapi import APIRouter, Query
from app.services.trend_service import trend_service

router = APIRouter()


@router.get("/genres")
async def get_genre_trends(
    period: str = Query(default="30d", pattern="^(7d|30d|90d|6m|1y)$"),
    region: str = Query(default="global"),
    limit: int = Query(default=12, ge=1, le=50),
):
    """Get genre popularity trends using the trained trend forecaster model."""
    return trend_service.get_genre_trends(period=period, region=region, limit=limit)


@router.get("/timeline")
async def get_trend_timeline(
    genre: str = Query(default="Pop"),
    period: str = Query(default="6m"),
):
    """Get time-series trend data for a genre from the forecaster model."""
    return trend_service.get_genre_timeline(genre=genre, period=period)
