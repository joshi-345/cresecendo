"""
Crescendo ML — Lyrics Emotion Dataset Downloader
Downloads a lyrics-with-emotions dataset from HuggingFace and prepares it
for DistilBERT fine-tuning.
Source: manoh2f2/tsterbak-lyrics-dataset-with-emotions (~37k songs)
"""

import json
from pathlib import Path

import httpx
import pandas as pd
from tqdm import tqdm


PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_ROOT = PROJECT_ROOT / "ml_pipeline"
OUTPUT_DIR = ML_ROOT / "data" / "raw"

DATASET_URL = (
    "https://huggingface.co/datasets/manoh2f2/"
    "tsterbak-lyrics-dataset-with-emotions/resolve/main/"
    "data/train-00000-of-00001.parquet"
)

# Map raw emotion labels to Crescendo's 8 emotion categories
EMOTION_MAP = {
    "happiness": "happiness",
    "happy": "happiness",
    "joy": "happiness",
    "sadness": "sadness",
    "sad": "sadness",
    "anger": "anger",
    "angry": "anger",
    "love": "love",
    "romantic": "love",
    "fear": "fear",
    "scared": "fear",
    "surprise": "excitement",
    "excitement": "excitement",
    "nostalgia": "nostalgia",
    "hope": "hope",
    "hopeful": "hope",
    "disgust": "anger",       # Map to nearest
    "neutral": "hope",        # Map to nearest positive
}

TARGET_EMOTIONS = [
    "happiness", "sadness", "anger", "love",
    "fear", "hope", "nostalgia", "excitement",
]


def download_lyrics_dataset(output_file: str = "lyrics_emotions.csv") -> pd.DataFrame:
    """Download and prepare the lyrics emotion dataset."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / output_file

    print(f"Downloading lyrics emotion dataset from HuggingFace...")
    print(f"URL: {DATASET_URL}\n")

    # Download parquet file
    tmp_path = output_path.with_suffix(".parquet")

    with httpx.stream("GET", DATASET_URL, follow_redirects=True, timeout=120) as resp:
        resp.raise_for_status()
        total = int(resp.headers.get("content-length", 0))

        with open(tmp_path, "wb") as f:
            with tqdm(total=total, unit="B", unit_scale=True, desc="Downloading") as pbar:
                for chunk in resp.iter_bytes(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))

    print("\nLoading and processing dataset...")
    df = pd.read_parquet(tmp_path)
    print(f"  Raw rows: {len(df)}")
    print(f"  Columns:  {list(df.columns)}")

    # Clean up
    # The dataset has: artist, seq (lyrics), song, emotions
    df = df.rename(columns={"seq": "text", "emotions": "emotion_raw"})

    # Drop rows without text or emotion
    df = df.dropna(subset=["text", "emotion_raw"])
    df = df[df["text"].str.strip().str.len() > 20]  # Need meaningful text

    # Map emotions to our 8 categories
    def map_emotion(raw_emotion: str) -> str:
        import ast
        raw = raw_emotion.strip()
        # Dataset stores emotions as "['fear']" format — parse it
        try:
            parsed = ast.literal_eval(raw)
            if isinstance(parsed, list) and len(parsed) > 0:
                raw = parsed[0].strip().lower()
            else:
                raw = raw.lower()
        except (ValueError, SyntaxError):
            raw = raw.lower()
        return EMOTION_MAP.get(raw, None)

    df["emotion"] = df["emotion_raw"].apply(map_emotion)
    df = df.dropna(subset=["emotion"])

    # Assign integer label
    label_map = {e: i for i, e in enumerate(TARGET_EMOTIONS)}
    df["label"] = df["emotion"].map(label_map)
    df = df.dropna(subset=["label"])
    df["label"] = df["label"].astype(int)

    # Keep relevant columns
    df = df[["text", "emotion", "label", "artist", "song"]].reset_index(drop=True)

    # Print distribution
    print(f"\n  Emotion distribution:")
    for emotion in TARGET_EMOTIONS:
        count = len(df[df["emotion"] == emotion])
        print(f"    {emotion:15s} {count:6d}")

    # Save
    df.to_csv(output_path, index=False)
    tmp_path.unlink(missing_ok=True)

    print(f"\n[OK] Saved {len(df)} labeled lyrics to {output_path}")
    return df


if __name__ == "__main__":
    download_lyrics_dataset()
