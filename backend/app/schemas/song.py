"""
Crescendo — Song Pydantic Schemas
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AudioFeaturesSchema(BaseModel):
    tempo: Optional[float] = None
    key: Optional[int] = None
    loudness: Optional[float] = None
    danceability: Optional[float] = Field(None, ge=0, le=1)
    energy: Optional[float] = Field(None, ge=0, le=1)
    acousticness: Optional[float] = Field(None, ge=0, le=1)
    instrumentalness: Optional[float] = Field(None, ge=0, le=1)
    valence: Optional[float] = Field(None, ge=0, le=1)
    speechiness: Optional[float] = Field(None, ge=0, le=1)
    liveness: Optional[float] = Field(None, ge=0, le=1)


class SongCreate(BaseModel):
    spotify_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=500)
    artist_name: str = Field(..., min_length=1, max_length=500)
    album: Optional[str] = None
    genre: Optional[str] = None
    audio_features: Optional[AudioFeaturesSchema] = None


class SongResponse(BaseModel):
    id: UUID
    spotify_id: Optional[str] = None
    title: str
    artist_name: str
    album: Optional[str] = None
    genre: Optional[str] = None
    cover_url: Optional[str] = None
    popularity: Optional[int] = None
    streams: Optional[int] = None
    audio_features: Optional[AudioFeaturesSchema] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SongSearch(BaseModel):
    query: str = Field(..., min_length=1)
    genre: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
