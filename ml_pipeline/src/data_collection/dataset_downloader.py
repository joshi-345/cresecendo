"""
Crescendo ML — Dataset Downloader (Fallback)
Downloads a public Spotify tracks dataset when the Spotify API is restricted.
Source: HuggingFace — maharshipandya/spotify-tracks-dataset (~114k tracks)
"""

import os
from pathlib import Path

import httpx
import pandas as pd
from tqdm import tqdm

PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_ROOT = PROJECT_ROOT / "ml_pipeline"
OUTPUT_DIR = ML_ROOT / "data" / "raw"

DATASET_URL = (
    "https://huggingface.co/datasets/maharshipandya/"
    "spotify-tracks-dataset/resolve/main/dataset.csv"
)

# Columns the ML pipeline expects
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


def download_dataset(output_file: str = "spotify_tracks.csv") -> pd.DataFrame:
    """Download the Spotify tracks dataset and save it in pipeline format."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / output_file

    print(f"Downloading Spotify dataset from HuggingFace...")
    print(f"URL: {DATASET_URL}\n")

    # Stream download with progress bar
    with httpx.stream("GET", DATASET_URL, follow_redirects=True, timeout=120) as resp:
        resp.raise_for_status()
        total = int(resp.headers.get("content-length", 0))
        tmp_path = output_path.with_suffix(".tmp")

        with open(tmp_path, "wb") as f:
            with tqdm(total=total, unit="B", unit_scale=True, desc="Downloading") as pbar:
                for chunk in resp.iter_bytes(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))

    print("\nLoading and processing dataset...")
    df = pd.read_csv(tmp_path)
    print(f"  Raw rows: {len(df)}")
    print(f"  Columns:  {list(df.columns)}\n")

    # --- Map to pipeline schema ---
    rename_map = {
        "track_id": "spotify_id",
        "track_name": "track_name",
        "artists": "artist_name",
        "danceability": "danceability",
        "energy": "energy",
        "loudness": "loudness",
        "speechiness": "speechiness",
        "acousticness": "acousticness",
        "instrumentalness": "instrumentalness",
        "liveness": "liveness",
        "valence": "valence",
        "tempo": "tempo",
        "duration_ms": "duration_ms",
        "popularity": "popularity",
        "track_genre": "genre",
        "album_name": "album",
        "key": "key",
        "mode": "mode",
        "time_signature": "time_signature",
        "explicit": "explicit",
    }

    existing = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=existing)

    # Drop rows missing core audio features
    df = df.dropna(subset=["danceability", "energy", "valence"])
    df = df.drop_duplicates(subset=["spotify_id"], keep="first")

    # Keep only mapped columns that exist
    keep_cols = [c for c in rename_map.values() if c in df.columns]
    df = df[keep_cols]

    # Verify required columns
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise RuntimeError(f"Dataset is missing required columns: {missing}")

    # Save
    df.to_csv(output_path, index=False)
    tmp_path.unlink(missing_ok=True)

    print(f"[OK] Saved {len(df)} tracks to {output_path}")
    print(f"  Columns: {list(df.columns)}")
    print(f"\nSample:")
    print(df.head(3).to_string(index=False))

    return df


if __name__ == "__main__":
    download_dataset()
