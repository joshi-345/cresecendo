"""
Crescendo — Emotion Pydantic Schemas
"""

from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class EmotionRequest(BaseModel):
    spotify_url: Optional[str] = None
    song_title: Optional[str] = None
    lyrics: Optional[str] = None


class SentimentBreakdown(BaseModel):
    name: str
    value: float = Field(..., ge=0, le=100)
    color: str


class LyricLine(BaseModel):
    text: str
    emotion: str
    confidence: float = Field(..., ge=0, le=1)


class EmotionResponse(BaseModel):
    analysis_id: UUID
    song_id: UUID
    overall_sentiment: str
    emotions: List[SentimentBreakdown]
    lyric_analysis: List[LyricLine]
    model_version: str

    model_config = {"from_attributes": True}
