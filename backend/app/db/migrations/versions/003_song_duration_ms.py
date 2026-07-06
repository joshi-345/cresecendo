"""Add duration_ms to songs table

Revision ID: 003_song_duration_ms
Revises: 002_user_billing_fields
Create Date: 2026-07-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003_song_duration_ms"
down_revision: Union[str, None] = "002_user_billing_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("songs", sa.Column("duration_ms", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("songs", "duration_ms")
