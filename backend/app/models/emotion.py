"""
Crescendo — Emotion Analysis ORM Model
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class EmotionAnalysis(Base):
    __tablename__ = "emotion_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    song_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("songs.id"), nullable=False, index=True
    )

    # Overall sentiment
    overall_sentiment: Mapped[str] = mapped_column(String(50), nullable=False)

    # Emotion scores (JSON: {emotion_name: score})
    emotions: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Line-by-line analysis (JSON array)
    lyric_analysis: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Hash of analyzed lyrics (for cache invalidation)
    lyrics_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Model metadata
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<EmotionAnalysis song={self.song_id} sentiment={self.overall_sentiment}>"
