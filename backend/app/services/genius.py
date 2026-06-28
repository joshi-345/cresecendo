"""
Crescendo — Genius Lyrics API Integration
"""

from typing import Optional
import httpx

from app.core.config import settings


class GeniusService:
    """Client for the Genius API to fetch song lyrics."""

    BASE_URL = "https://api.genius.com"

    def __init__(self):
        self._client = httpx.AsyncClient(
            timeout=30.0,
            headers={"Authorization": f"Bearer {settings.GENIUS_ACCESS_TOKEN}"},
        )

    async def search(self, query: str) -> list[dict]:
        """Search for songs on Genius."""
        response = await self._client.get(
            f"{self.BASE_URL}/search",
            params={"q": query},
        )
        response.raise_for_status()
        hits = response.json().get("response", {}).get("hits", [])
        return [hit["result"] for hit in hits]

    async def get_song(self, song_id: int) -> dict:
        """Get song metadata from Genius."""
        response = await self._client.get(f"{self.BASE_URL}/songs/{song_id}")
        response.raise_for_status()
        return response.json().get("response", {}).get("song", {})

    async def get_lyrics_url(self, query: str) -> Optional[str]:
        """Search for a song and return its Genius lyrics URL."""
        results = await self.search(query)
        if results:
            return results[0].get("url")
        return None

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()


# Singleton instance
genius_service = GeniusService()
