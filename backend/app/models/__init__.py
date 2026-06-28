"""Models package — Barrel exports for all ORM models."""

from app.models.user import User
from app.models.song import Song
from app.models.artist import Artist
from app.models.prediction import Prediction
from app.models.emotion import EmotionAnalysis

__all__ = ["User", "Song", "Artist", "Prediction", "EmotionAnalysis"]
