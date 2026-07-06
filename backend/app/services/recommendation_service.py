"""
Crescendo — Recommendation Service
Generates personalized song recommendations using prediction history,
genre classifier, and the songs database.
"""

import random
from uuid import UUID
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction
from app.models.song import Song
from app.ml_integration.model_loader import model_manager
from app.ml_integration.feature_extractor import FeatureExtractor


class RecommendationService:
    """Generates personalized recommendations from prediction history and ML models."""

    REASON_TEMPLATES = {
        "genre": "Trending in {genre} — your top analyzed genre",
        "popularity": "High popularity score ({popularity})",
        "audio_match": "Similar audio fingerprint to your predictions",
        "undiscovered": "Hidden gem with strong viral potential",
        "diverse": "Expanding your taste profile",
    }

    def __init__(self):
        self.feature_extractor = FeatureExtractor()

    async def get_recommendations(
        self,
        db: AsyncSession,
        user_id: UUID,
        genre: Optional[str] = None,
        limit: int = 8,
    ) -> list[dict]:
        """
        Generate recommendations for a user based on their prediction history.

        Strategy:
        1. Find the user's most-analyzed genres from prediction history
        2. Query for songs in those genres the user hasn't predicted yet
        3. Rank by popularity and add genre classifier confidence
        4. If no history, return popular undiscovered tracks
        """
        # Step 1: Get user's analyzed song IDs
        predicted_song_ids_q = await db.execute(
            select(Prediction.song_id)
            .where(Prediction.user_id == user_id)
            .distinct()
        )
        predicted_song_ids = {row[0] for row in predicted_song_ids_q.all()}

        # Step 2: Find user's top genres from their analyzed songs
        user_genres = []
        if predicted_song_ids:
            genre_q = await db.execute(
                select(Song.genre, func.count(Song.id).label("cnt"))
                .where(Song.id.in_(predicted_song_ids))
                .where(Song.genre.isnot(None))
                .group_by(Song.genre)
                .order_by(desc("cnt"))
                .limit(5)
            )
            user_genres = [row[0] for row in genre_q.all()]

        # Step 3: Build recommendation query
        query = select(Song).where(Song.id.notin_(predicted_song_ids) if predicted_song_ids else True)

        if genre:
            query = query.where(Song.genre.ilike(f"%{genre}%"))
        elif user_genres:
            # Prefer songs in the user's top genres
            query = query.where(Song.genre.in_(user_genres))

        query = query.order_by(desc(Song.popularity)).limit(limit * 2)  # Fetch more, then diversify

        result = await db.execute(query)
        candidate_songs = result.scalars().all()

        if not candidate_songs:
            # Fallback: return most popular songs overall
            fallback_q = await db.execute(
                select(Song)
                .where(Song.id.notin_(predicted_song_ids) if predicted_song_ids else True)
                .order_by(desc(Song.popularity))
                .limit(limit)
            )
            candidate_songs = fallback_q.scalars().all()

        # Step 4: Score and rank candidates
        recommendations = []
        for song in candidate_songs[:limit]:
            confidence = self._compute_confidence(song, user_genres)
            reason = self._generate_reason(song, user_genres)

            recommendations.append({
                "song_id": str(song.id),
                "title": song.title,
                "artist": song.artist_name,
                "album": song.album,
                "genre": song.genre,
                "cover_url": song.cover_url,
                "popularity": song.popularity,
                "confidence": confidence,
                "reason": reason,
            })

        # Sort by confidence descending
        recommendations.sort(key=lambda x: x["confidence"], reverse=True)
        return recommendations

    async def refresh_recommendations(
        self,
        db: AsyncSession,
        user_id: UUID,
    ) -> list[dict]:
        """Regenerate recommendations with randomized weighting for diversity."""
        recs = await self.get_recommendations(db, user_id, limit=12)
        # Shuffle to add variety on refresh
        random.shuffle(recs)
        return recs[:8]

    def _compute_confidence(self, song: Song, user_genres: list[str]) -> int:
        """Compute a recommendation confidence score (0-100)."""
        score = 50  # Base score

        # Genre match bonus
        if song.genre and user_genres and song.genre in user_genres:
            genre_rank = user_genres.index(song.genre)
            score += max(0, 30 - genre_rank * 8)  # Top genre gets +30

        # Popularity bonus (normalized 0-20)
        if song.popularity:
            score += min(20, int(song.popularity * 0.2))

        # Audio feature quality bonus
        if song.danceability and song.energy:
            audio_quality = (song.danceability + song.energy) / 2
            score += int(audio_quality * 10)

        # Use genre classifier for additional signal
        genre_bundle = model_manager.get_model("genre_classifier")
        if genre_bundle and song.danceability is not None:
            try:
                features = self.feature_extractor.extract(audio_features={
                    "danceability": song.danceability or 0.5,
                    "energy": song.energy or 0.5,
                    "loudness": song.loudness or -6.0,
                    "speechiness": song.speechiness or 0.05,
                    "acousticness": song.acousticness or 0.5,
                    "instrumentalness": song.instrumentalness or 0.0,
                    "liveness": song.liveness or 0.1,
                    "valence": song.valence or 0.5,
                    "tempo": song.tempo or 120.0,
                    "duration_ms": song.duration_ms or 200000,
                })
                model = genre_bundle["model"]
                proba = model.predict_proba([features])[0]
                max_confidence = float(proba.max())
                score += int(max_confidence * 10)  # Up to +10 for strong genre signal
            except Exception:
                pass

        return min(99, max(50, score))

    def _generate_reason(self, song: Song, user_genres: list[str]) -> str:
        """Generate a human-readable recommendation reason."""
        if song.genre and user_genres and song.genre in user_genres:
            return self.REASON_TEMPLATES["genre"].format(genre=song.genre.title())
        if song.popularity and song.popularity > 70:
            return self.REASON_TEMPLATES["popularity"].format(popularity=song.popularity)
        if song.danceability and song.danceability > 0.7:
            return self.REASON_TEMPLATES["audio_match"]
        if song.popularity and song.popularity < 40:
            return self.REASON_TEMPLATES["undiscovered"]
        return self.REASON_TEMPLATES["diverse"]


# Singleton
recommendation_service = RecommendationService()
