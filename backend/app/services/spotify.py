"""
Crescendo — Spotify API Integration Service
"""

import base64
from typing import Optional

import httpx

from app.core.config import settings


class SpotifyService:
    """Client for the Spotify Web API."""

    BASE_URL = "https://api.spotify.com/v1"
    AUTH_URL = "https://accounts.spotify.com/api/token"

    def __init__(self):
        self._access_token: Optional[str] = None
        self._client = httpx.AsyncClient(timeout=30.0)

    async def _get_token(self) -> str:
        """Get a client credentials access token."""
        if self._access_token:
            return self._access_token

        credentials = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
        encoded = base64.b64encode(credentials.encode()).decode()

        response = await self._client.post(
            self.AUTH_URL,
            headers={"Authorization": f"Basic {encoded}"},
            data={"grant_type": "client_credentials"},
        )
        response.raise_for_status()
        self._access_token = response.json()["access_token"]
        return self._access_token

    async def _request(self, endpoint: str, params: dict | None = None) -> dict:
        """Make an authenticated request to the Spotify API."""
        token = await self._get_token()
        response = await self._client.get(
            f"{self.BASE_URL}{endpoint}",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        response.raise_for_status()
        return response.json()

    async def search_tracks(self, query: str, limit: int = 20) -> dict:
        """Search for tracks."""
        return await self._request("/search", {"q": query, "type": "track", "limit": limit})

    async def get_track(self, track_id: str) -> dict:
        """Get track details."""
        return await self._request(f"/tracks/{track_id}")

    async def get_audio_features(self, track_id: str) -> dict:
        """Get audio features for a track."""
        return await self._request(f"/audio-features/{track_id}")

    async def get_artist(self, artist_id: str) -> dict:
        """Get artist details."""
        return await self._request(f"/artists/{artist_id}")

    async def get_artist_top_tracks(self, artist_id: str, market: str = "US") -> dict:
        """Get an artist's top tracks."""
        return await self._request(f"/artists/{artist_id}/top-tracks", {"market": market})

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()


# Singleton instance
spotify_service = SpotifyService()
