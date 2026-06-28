"""
Crescendo — Song Routes
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func

from app.api.dependencies import DbSession, CurrentUser
from app.models.song import Song
from app.schemas.song import SongCreate, SongResponse
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[SongResponse])
async def list_songs(
    db: DbSession,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """List songs with pagination."""
    offset = (page - 1) * limit

    # Count
    count_result = await db.execute(select(func.count(Song.id)))
    total = count_result.scalar_one()

    # Fetch
    result = await db.execute(
        select(Song).order_by(Song.created_at.desc()).offset(offset).limit(limit)
    )
    songs = result.scalars().all()

    return PaginatedResponse(
        items=[SongResponse.model_validate(s) for s in songs],
        total=total,
        page=page,
        limit=limit,
        has_more=(offset + limit) < total,
    )


@router.get("/search")
async def search_songs(
    db: DbSession,
    q: str = Query(..., min_length=1),
    genre: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
):
    """Search songs by title or artist name."""
    query = select(Song).where(
        (Song.title.ilike(f"%{q}%")) | (Song.artist_name.ilike(f"%{q}%"))
    )
    if genre:
        query = query.where(Song.genre == genre)

    result = await db.execute(query.limit(limit))
    songs = result.scalars().all()

    return [SongResponse.model_validate(s) for s in songs]


@router.get("/{song_id}", response_model=SongResponse)
async def get_song(song_id: UUID, db: DbSession):
    """Get a song by ID."""
    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")
    return SongResponse.model_validate(song)


@router.post("", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
async def create_song(data: SongCreate, db: DbSession, current_user: CurrentUser):
    """Create a new song record."""
    song = Song(
        spotify_id=data.spotify_id,
        title=data.title,
        artist_name=data.artist_name,
        album=data.album,
        genre=data.genre,
    )
    if data.audio_features:
        for key, value in data.audio_features.model_dump(exclude_none=True).items():
            setattr(song, key, value)

    db.add(song)
    await db.flush()
    await db.refresh(song)

    return SongResponse.model_validate(song)
