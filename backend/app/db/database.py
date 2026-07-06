"""
Crescendo — Database Connection
Async SQLAlchemy engine and session factory.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine_kwargs = {
    "echo": settings.DEBUG,
    "connect_args": {"check_same_thread": False}
}

# --- Async Engine ---
engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

# --- Session Factory ---
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# --- Base Model ---
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def init_db() -> None:
    """Create local SQLite tables for dependency-light development."""
    import app.models  # noqa: F401 - registers ORM models with Base.metadata

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


# --- Dependency ---
async def get_db() -> AsyncSession:
    """FastAPI dependency that provides a database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
