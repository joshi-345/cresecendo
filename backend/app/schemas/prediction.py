"""
Crescendo — Prediction Pydantic Schemas
"""

from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    spotify_url: Optional[str] = None
    song_title: Optional[str] = None
    artist_name: Optional[str] = None


class ViralScore(BaseModel):
    viral_score: float = Field(..., ge=0, le=100)
    success_probability: float = Field(..., ge=0, le=1)
    confidence_score: float = Field(..., ge=0, le=1)
    growth_forecast: str
    model_version: str
    top_factors: List[dict]


class PredictionResponse(BaseModel):
    prediction_id: UUID
    song_id: UUID
    song_title: Optional[str] = None
    artist_name: Optional[str] = None
    prediction: ViralScore
    processing_time_ms: float

    model_config = {"from_attributes": True}
