"""
Crescendo — Prediction Routes
"""

import time
import re
import uuid
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func

from app.api.dependencies import DbSession, CurrentUser
from app.models.prediction import Prediction
from app.models.song import Song
from app.schemas.prediction import PredictionRequest, PredictionResponse, ViralScore
from app.schemas.common import PaginatedResponse
from app.services.spotify import spotify_service
from app.services.prediction_service import prediction_service

router = APIRouter()

DEFAULT_AUDIO_FEATURES = {
    "danceability": 0.5,
    "energy": 0.5,
    "loudness": -6.0,
    "speechiness": 0.05,
    "acousticness": 0.5,
    "instrumentalness": 0.0,
    "liveness": 0.1,
    "valence": 0.5,
    "tempo": 120.0,
    "duration_ms": 200000.0,
}

def extract_spotify_id(url_or_uri: Optional[str]) -> Optional[str]:
    """Parse Spotify track ID from URL or URI."""
    if not url_or_uri:
        return None
    # e.g., https://open.spotify.com/track/4PTG3Z6ehGkBFn2Ohkyw7v?si=...
    if "/track/" in url_or_uri:
        match = re.search(r"/track/([a-zA-Z0-9]+)", url_or_uri)
        if match:
            return match.group(1)
    # e.g., spotify:track:4PTG3Z6ehGkBFn2Ohkyw7v
    if "spotify:track:" in url_or_uri:
        match = re.search(r"spotify:track:([a-zA-Z0-9]+)", url_or_uri)
        if match:
            return match.group(1)
    return None

@router.post("/analyze", response_model=PredictionResponse)
async def analyze_song(
    data: PredictionRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Run AI viral prediction on a song, save to DB, and return score."""
    # Quota check
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    count_result = await db.execute(
        select(func.count(Prediction.id)).where(
            Prediction.user_id == current_user.id,
            Prediction.created_at >= start_of_month,
        )
    )
    predictions_this_month = count_result.scalar_one()

    tier = current_user.subscription_tier or "free"
    limit = 3
    if tier == "pro":
        limit = 50
    elif tier == "studio":
        limit = 999999

    if predictions_this_month >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Monthly limit reached ({limit} predictions/month on {tier.upper()} tier). Please upgrade your plan in settings.",
        )

    start_time = time.time()

    spotify_id = extract_spotify_id(data.spotify_url)
    title = data.song_title or ""
    artist_name = data.artist_name or ""
    album = None
    cover_url = None
    popularity = None
    features_dict = DEFAULT_AUDIO_FEATURES.copy()

    # Step 1: Resolve song metadata and audio features
    if spotify_id:
        try:
            track = await spotify_service.get_track(spotify_id)
            title = track.get("name", title)
            artist_name = ", ".join([a["name"] for a in track.get("artists", [])]) if track.get("artists") else artist_name
            album = track.get("album", {}).get("name")
            cover_url = track.get("album", {}).get("images", [{}])[0].get("url") if track.get("album", {}).get("images") else None
            popularity = track.get("popularity")
            
            features = await spotify_service.get_audio_features(spotify_id)
            if features:
                for k in features_dict:
                    if k in features:
                        features_dict[k] = features[k]
        except Exception as e:
            print(f"[PredictionRoute] Failed to fetch Spotify track {spotify_id}: {e}")
    elif title and artist_name:
        try:
            search_res = await spotify_service.search_tracks(f"{title} {artist_name}", limit=1)
            items = search_res.get("tracks", {}).get("items", [])
            if items:
                track = items[0]
                spotify_id = track.get("id")
                title = track.get("name", title)
                artist_name = ", ".join([a["name"] for a in track.get("artists", [])]) if track.get("artists") else artist_name
                album = track.get("album", {}).get("name")
                cover_url = track.get("album", {}).get("images", [{}])[0].get("url") if track.get("album", {}).get("images") else None
                popularity = track.get("popularity")
                
                if spotify_id:
                    features = await spotify_service.get_audio_features(spotify_id)
                    if features:
                        for k in features_dict:
                            if k in features:
                                features_dict[k] = features[k]
        except Exception as e:
            print(f"[PredictionRoute] Failed to search or fetch features for {title} {artist_name}: {e}")

    # Fallback default title/artist if empty
    if not title:
        title = "Unknown Song"
    if not artist_name:
        artist_name = "Unknown Artist"

    # Step 2: Check if song exists or save new song to DB
    song = None
    if spotify_id:
        result = await db.execute(select(Song).where(Song.spotify_id == spotify_id))
        song = result.scalar_one_or_none()

    if not song:
        result = await db.execute(
            select(Song).where(
                (Song.title.ilike(title)) & (Song.artist_name.ilike(artist_name))
            )
        )
        song = result.scalar_one_or_none()

    if not song:
        song = Song(
            spotify_id=spotify_id,
            title=title,
            artist_name=artist_name,
            album=album,
            cover_url=cover_url,
            popularity=popularity,
            danceability=features_dict.get("danceability"),
            energy=features_dict.get("energy"),
            loudness=features_dict.get("loudness"),
            speechiness=features_dict.get("speechiness"),
            acousticness=features_dict.get("acousticness"),
            instrumentalness=features_dict.get("instrumentalness"),
            liveness=features_dict.get("liveness"),
            valence=features_dict.get("valence"),
            tempo=features_dict.get("tempo"),
            duration_ms=features_dict.get("duration_ms"),
        )
        db.add(song)
        await db.flush()
        await db.refresh(song)

    # Step 3: Run model prediction
    result = await prediction_service.predict_virality(
        audio_features=features_dict,
        artist_metrics={"popularity": popularity or 50} if popularity is not None else None,
    )

    # Step 4: Persist prediction outcome to DB
    prediction = Prediction(
        song_id=song.id,
        user_id=current_user.id,
        viral_score=result["viral_score"],
        success_probability=result["success_probability"],
        confidence_score=result["confidence_score"],
        growth_forecast=result["growth_forecast"],
        model_version="v1.0.0",
        top_factors=result["top_factors"],
    )
    db.add(prediction)
    await db.flush()
    await db.refresh(prediction)

    processing_time = (time.time() - start_time) * 1000

    return PredictionResponse(
        prediction_id=prediction.id,
        song_id=song.id,
        song_title=song.title,
        artist_name=song.artist_name,
        prediction=ViralScore(
            viral_score=prediction.viral_score,
            success_probability=prediction.success_probability,
            confidence_score=prediction.confidence_score,
            growth_forecast=prediction.growth_forecast or "",
            model_version=prediction.model_version,
            top_factors=prediction.top_factors or [],
        ),
        processing_time_ms=processing_time,
    )

@router.get("", response_model=PaginatedResponse[PredictionResponse])
async def list_user_predictions(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """List the current user's prediction history with pagination."""
    offset = (page - 1) * limit

    # Count user's predictions
    count_result = await db.execute(
        select(func.count(Prediction.id)).where(Prediction.user_id == current_user.id)
    )
    total = count_result.scalar_one()

    # Fetch user's predictions with Song joined
    result = await db.execute(
        select(Prediction, Song)
        .join(Song, Prediction.song_id == Song.id)
        .where(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    predictions_and_songs = result.all()

    items = []
    for p, s in predictions_and_songs:
        items.append(
            PredictionResponse(
                prediction_id=p.id,
                song_id=p.song_id,
                song_title=s.title,
                artist_name=s.artist_name,
                prediction=ViralScore(
                    viral_score=p.viral_score,
                    success_probability=p.success_probability,
                    confidence_score=p.confidence_score,
                    growth_forecast=p.growth_forecast or "",
                    model_version=p.model_version,
                    top_factors=p.top_factors or [],
                ),
                processing_time_ms=0.0,
            )
        )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        has_more=(offset + limit) < total,
    )

@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(prediction_id: UUID, db: DbSession, current_user: CurrentUser):
    """Get a specific prediction result."""
    result = await db.execute(
        select(Prediction, Song)
        .join(Song, Prediction.song_id == Song.id)
        .where(
            Prediction.id == prediction_id,
            Prediction.user_id == current_user.id,
        )
    )
    res = result.one_or_none()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")

    prediction, song = res

    return PredictionResponse(
        prediction_id=prediction.id,
        song_id=prediction.song_id,
        song_title=song.title,
        artist_name=song.artist_name,
        prediction=ViralScore(
            viral_score=prediction.viral_score,
            success_probability=prediction.success_probability,
            confidence_score=prediction.confidence_score,
            growth_forecast=prediction.growth_forecast or "",
            model_version=prediction.model_version,
            top_factors=prediction.top_factors or [],
        ),
        processing_time_ms=0,
    )
