"""Initial schema — users, songs, artists, predictions, emotion_analyses

Revision ID: 001_initial
Revises: None
Create Date: 2026-06-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Users ---
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("artist", "label", "producer", "marketer", "other", name="user_role"),
            server_default="artist",
        ),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- Artists ---
    op.create_table(
        "artists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("spotify_id", sa.String(255), unique=True, nullable=True),
        sa.Column("name", sa.String(500), nullable=False),
        sa.Column("genres", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("followers", sa.Integer(), server_default="0"),
        sa.Column("monthly_listeners", sa.Integer(), server_default="0"),
        sa.Column("popularity", sa.Integer(), server_default="0"),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("growth_data", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_artists_spotify_id", "artists", ["spotify_id"], unique=True)
    op.create_index("ix_artists_name", "artists", ["name"])

    # --- Songs ---
    op.create_table(
        "songs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("spotify_id", sa.String(255), unique=True, nullable=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("artist_name", sa.String(500), nullable=False),
        sa.Column("album", sa.String(500), nullable=True),
        sa.Column("genre", sa.String(100), nullable=True),
        sa.Column("release_date", sa.String(20), nullable=True),
        sa.Column("cover_url", sa.String(500), nullable=True),
        # Audio features
        sa.Column("tempo", sa.Float(), nullable=True),
        sa.Column("key", sa.Integer(), nullable=True),
        sa.Column("loudness", sa.Float(), nullable=True),
        sa.Column("danceability", sa.Float(), nullable=True),
        sa.Column("energy", sa.Float(), nullable=True),
        sa.Column("acousticness", sa.Float(), nullable=True),
        sa.Column("instrumentalness", sa.Float(), nullable=True),
        sa.Column("valence", sa.Float(), nullable=True),
        sa.Column("speechiness", sa.Float(), nullable=True),
        sa.Column("liveness", sa.Float(), nullable=True),
        # Metrics
        sa.Column("streams", sa.Integer(), nullable=True),
        sa.Column("popularity", sa.Integer(), nullable=True),
        sa.Column("extra_data", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_songs_spotify_id", "songs", ["spotify_id"], unique=True)
    op.create_index("ix_songs_created_at", "songs", ["created_at"])

    # --- Predictions ---
    op.create_table(
        "predictions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "song_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("songs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("viral_score", sa.Float(), nullable=False),
        sa.Column("success_probability", sa.Float(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("growth_forecast", sa.String(500), nullable=True),
        sa.Column("model_version", sa.String(50), nullable=False),
        sa.Column("top_factors", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_predictions_song_id", "predictions", ["song_id"])
    op.create_index("ix_predictions_user_id", "predictions", ["user_id"])
    op.create_index("ix_predictions_created_at", "predictions", ["created_at"])

    # --- Emotion Analyses ---
    op.create_table(
        "emotion_analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "song_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("songs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("overall_sentiment", sa.String(50), nullable=False),
        sa.Column("emotions", postgresql.JSON(), nullable=False),
        sa.Column("lyric_analysis", postgresql.JSON(), nullable=True),
        sa.Column("lyrics_hash", sa.String(64), nullable=True),
        sa.Column("model_version", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_emotion_analyses_song_id", "emotion_analyses", ["song_id"])


def downgrade() -> None:
    op.drop_table("emotion_analyses")
    op.drop_table("predictions")
    op.drop_table("songs")
    op.drop_table("artists")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
