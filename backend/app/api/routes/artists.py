"""
Crescendo — Artist Routes
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select

from app.api.dependencies import DbSession
from app.models.artist import Artist
from app.schemas.artist import ArtistResponse

router = APIRouter()


@router.get("", response_model=list[ArtistResponse])
async def list_artists(
    db: DbSession,
    limit: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="popularity", pattern="^(popularity|followers|monthly_listeners|name)$"),
):
    """List artists sorted by the given criteria."""
    order_col = getattr(Artist, sort_by, Artist.popularity)
    result = await db.execute(
        select(Artist).order_by(order_col.desc()).limit(limit)
    )
    artists = result.scalars().all()
    return [ArtistResponse.model_validate(a) for a in artists]


@router.get("/{artist_id}", response_model=ArtistResponse)
async def get_artist(artist_id: UUID, db: DbSession):
    """Get an artist by ID."""
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    return ArtistResponse.model_validate(artist)


@router.get("/{artist_id}/growth")
async def get_artist_growth(artist_id: UUID, db: DbSession):
    """Get growth timeline for an artist."""
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    return {
        "artist": ArtistResponse.model_validate(artist),
        "timeline": artist.growth_data or [],
    }
