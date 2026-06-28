"""
Crescendo — Artist Pydantic Schemas
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class ArtistCreate(BaseModel):
    spotify_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=500)
    genres: Optional[List[str]] = None


class ArtistResponse(BaseModel):
    id: UUID
    spotify_id: Optional[str] = None
    name: str
    genres: Optional[List[str]] = None
    followers: int
    monthly_listeners: int
    popularity: int
    image_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtistGrowth(BaseModel):
    artist: ArtistResponse
    timeline: List[dict]
