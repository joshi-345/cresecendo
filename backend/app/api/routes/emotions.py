"""
Crescendo — Emotion Analysis Routes
"""

import uuid
from fastapi import APIRouter, HTTPException
from app.api.dependencies import DbSession, CurrentUser
from app.schemas.emotion import EmotionRequest, EmotionResponse, SentimentBreakdown, LyricLine
from app.services.emotion_service import emotion_service
from app.core.config import settings

router = APIRouter()


@router.post("/analyze", response_model=EmotionResponse)
async def analyze_emotions(
    data: EmotionRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Analyze lyrics for emotional content using local NLP."""
    if not data.lyrics:
        raise HTTPException(status_code=400, detail="Lyrics are required for emotion analysis.")

    analysis = await emotion_service.analyze(data.lyrics)

    return EmotionResponse(
        analysis_id=uuid.uuid4(),
        song_id=uuid.uuid4(),
        overall_sentiment=analysis["overall_sentiment"],
        emotions=[
            SentimentBreakdown(**emotion)
            for emotion in analysis["emotions"]
        ],
        lyric_analysis=[
            LyricLine(**line)
            for line in analysis["lyric_analysis"]
        ],
        model_version=f"{settings.MODEL_VERSION}:{settings.OLLAMA_SENTIMENT_MODEL}",
    )
