"""
Crescendo — Recommendation Routes
"""

from fastapi import APIRouter, Query
from app.api.dependencies import DbSession, CurrentUser
from app.services.recommendation_service import recommendation_service

router = APIRouter()


@router.get("")
async def get_recommendations(
    db: DbSession,
    current_user: CurrentUser,
    genre: str | None = Query(default=None, description="Filter by genre"),
    limit: int = Query(default=8, ge=1, le=20),
):
    """Get personalized AI-powered recommendations based on prediction history."""
    recommendations = await recommendation_service.get_recommendations(
        db=db,
        user_id=current_user.id,
        genre=genre,
        limit=limit,
    )
    return {
        "user_id": str(current_user.id),
        "source": "recommendation_engine",
        "recommendations": recommendations,
    }


@router.post("/refresh")
async def refresh_recommendations(
    db: DbSession,
    current_user: CurrentUser,
):
    """Regenerate recommendations with fresh data and diversity weighting."""
    recommendations = await recommendation_service.refresh_recommendations(
        db=db,
        user_id=current_user.id,
    )
    return {
        "message": "Recommendations refreshed",
        "user_id": str(current_user.id),
        "source": "recommendation_engine",
        "recommendations": recommendations,
    }
