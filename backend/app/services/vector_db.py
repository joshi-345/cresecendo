"""
Crescendo — Pinecone Vector Database Integration
"""

from typing import Optional
from app.core.config import settings


class VectorDBService:
    """Client for Pinecone vector database operations."""

    def __init__(self):
        self._index = None
        self._initialized = False

    async def initialize(self):
        """Initialize Pinecone client and connect to index."""
        if self._initialized:
            return

        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            self._index = pc.Index(settings.PINECONE_INDEX_NAME)
            self._initialized = True
        except Exception as e:
            print(f"[VectorDB] Failed to initialize Pinecone: {e}")

    async def upsert_embedding(
        self,
        id: str,
        embedding: list[float],
        metadata: Optional[dict] = None,
    ) -> bool:
        """Store a song embedding in the vector database."""
        if not self._initialized:
            await self.initialize()

        if self._index is None:
            return False

        self._index.upsert(
            vectors=[{"id": id, "values": embedding, "metadata": metadata or {}}]
        )
        return True

    async def query_similar(
        self,
        embedding: list[float],
        top_k: int = 10,
        filter_metadata: Optional[dict] = None,
    ) -> list[dict]:
        """Query for similar songs by embedding vector."""
        if not self._initialized:
            await self.initialize()

        if self._index is None:
            return []

        results = self._index.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_metadata,
        )

        return [
            {
                "id": match["id"],
                "score": match["score"],
                "metadata": match.get("metadata", {}),
            }
            for match in results.get("matches", [])
        ]

    async def delete_embedding(self, id: str) -> bool:
        """Delete an embedding by ID."""
        if not self._initialized:
            await self.initialize()

        if self._index is None:
            return False

        self._index.delete(ids=[id])
        return True


# Singleton instance
vector_db_service = VectorDBService()
