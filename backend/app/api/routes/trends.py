"""
Crescendo — Trend Routes
"""

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/genres")
async def get_genre_trends(
    period: str = Query(default="30d", pattern="^(7d|30d|90d|6m|1y)$"),
    region: str = Query(default="global"),
):
    """Get genre popularity trends."""
    # TODO: Aggregate from data pipeline
    return {
        "period": period,
        "region": region,
        "genres": [
            {"name": "Afrobeats", "direction": "up", "change": "+34.2%", "listeners": 89_000_000},
            {"name": "Hyperpop", "direction": "up", "change": "+28.7%", "listeners": 12_000_000},
            {"name": "Latin Pop", "direction": "up", "change": "+22.1%", "listeners": 156_000_000},
            {"name": "Lo-fi", "direction": "down", "change": "-5.3%", "listeners": 45_000_000},
            {"name": "K-Pop", "direction": "up", "change": "+18.4%", "listeners": 198_000_000},
            {"name": "Neo-Soul", "direction": "up", "change": "+41.6%", "listeners": 23_000_000},
        ],
    }


@router.get("/timeline")
async def get_trend_timeline(
    genre: str = Query(default="Pop"),
    period: str = Query(default="6m"),
):
    """Get time-series trend data for a genre."""
    # TODO: Fetch from analytics DB
    return {
        "genre": genre,
        "period": period,
        "data": [
            {"month": "Jan", "value": 65},
            {"month": "Feb", "value": 72},
            {"month": "Mar", "value": 68},
            {"month": "Apr", "value": 80},
            {"month": "May", "value": 85},
            {"month": "Jun", "value": 92},
        ],
    }
