"""
Crescendo ML - Spotify Data Collector
Batch fetch training data from the Spotify API.
"""

import base64
import os
import time
from pathlib import Path

import httpx
import pandas as pd
from dotenv import load_dotenv
from tqdm import tqdm


PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_ROOT = PROJECT_ROOT / "ml_pipeline"

load_dotenv(PROJECT_ROOT / ".env")

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")

BASE_URL = "https://api.spotify.com/v1"
AUTH_URL = "https://accounts.spotify.com/api/token"
OUTPUT_DIR = ML_ROOT / "data" / "raw"

REQUIRED_COLUMNS = [
    "spotify_id",
    "track_name",
    "artist_name",
    "danceability",
    "energy",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "duration_ms",
    "popularity",
]


def get_access_token() -> str:
    """Get a Spotify Client Credentials access token."""
    if (
        not SPOTIFY_CLIENT_ID
        or not SPOTIFY_CLIENT_SECRET
        or SPOTIFY_CLIENT_ID.startswith("your-")
        or SPOTIFY_CLIENT_SECRET.startswith("your-")
    ):
        raise RuntimeError(
            "Missing Spotify credentials. Create D:\\crescendo\\.env and set "
            "real SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET values from the "
            "Spotify Developer Dashboard."
        )

    credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()

    response = httpx.post(
        AUTH_URL,
        headers={"Authorization": f"Basic {encoded}"},
        data={"grant_type": "client_credentials"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def fetch_playlist_tracks(token: str, playlist_id: str) -> list[dict]:
    """Fetch all tracks from a Spotify playlist."""
    tracks = []
    url = f"{BASE_URL}/playlists/{playlist_id}/tracks"
    headers = {"Authorization": f"Bearer {token}"}

    while url:
        response = httpx.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        tracks.extend(data.get("items", []))
        url = data.get("next")
        time.sleep(0.1)

    return tracks


def fetch_audio_features(token: str, track_ids: list[str]) -> list[dict]:
    """Fetch audio features for tracks in batches of 100."""
    headers = {"Authorization": f"Bearer {token}"}
    features = []

    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i + 100]
        response = httpx.get(
            f"{BASE_URL}/audio-features",
            headers=headers,
            params={"ids": ",".join(batch)},
            timeout=30,
        )

        if response.status_code in {403, 404}:
            raise RuntimeError(
                "Spotify audio-features endpoint is not available for this app. "
                "Spotify has restricted some Web API access for newer apps. "
                "Use an existing approved Spotify app or a Kaggle Spotify audio "
                "features dataset instead."
            )

        response.raise_for_status()
        features.extend(response.json().get("audio_features", []))
        time.sleep(0.1)

    return features


def collect_training_data(
    playlist_ids: list[str],
    output_file: str = "spotify_tracks.csv",
) -> pd.DataFrame:
    """Collect Spotify tracks with audio features and save them to CSV."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Getting Spotify access token...")
    token = get_access_token()

    all_tracks = []

    for playlist_id in tqdm(playlist_ids, desc="Playlists"):
        playlist_items = fetch_playlist_tracks(token, playlist_id)
        track_rows = []
        track_ids = []

        for item in playlist_items:
            track = item.get("track")
            if not track or not track.get("id"):
                continue

            artists = track.get("artists") or []
            album = track.get("album") or {}
            track_rows.append({
                "spotify_id": track["id"],
                "track_name": track.get("name", ""),
                "artist_name": artists[0]["name"] if artists else "",
                "album": album.get("name", ""),
                "popularity": track.get("popularity", 0),
                "duration_ms": track.get("duration_ms", 0),
                "release_date": album.get("release_date", ""),
            })
            track_ids.append(track["id"])

        if not track_ids:
            continue

        audio_features = fetch_audio_features(token, track_ids)
        for row, features in zip(track_rows, audio_features):
            if not features:
                continue
            row.update({
                "danceability": features.get("danceability"),
                "energy": features.get("energy"),
                "key": features.get("key"),
                "loudness": features.get("loudness"),
                "speechiness": features.get("speechiness"),
                "acousticness": features.get("acousticness"),
                "instrumentalness": features.get("instrumentalness"),
                "liveness": features.get("liveness"),
                "valence": features.get("valence"),
                "tempo": features.get("tempo"),
            })

        all_tracks.extend(track_rows)

    df = pd.DataFrame(all_tracks)
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise RuntimeError(f"Collected data is missing required columns: {missing_cols}")

    df = df.dropna(subset=["danceability", "energy", "valence"])
    df = df.drop_duplicates(subset=["spotify_id"], keep="first")

    output_path = OUTPUT_DIR / output_file
    df.to_csv(output_path, index=False)
    print(f"Saved {len(df)} tracks to {output_path}")

    return df


if __name__ == "__main__":
    playlists = [
        "37i9dQZF1DXcBWIGoYBM5M",  # Today's Top Hits
        "37i9dQZF1DX0XUsuxWHRQd",  # RapCaviar
        "37i9dQZF1DWXRqgorJj26U",  # Rock Classics
    ]
    collect_training_data(playlists)
