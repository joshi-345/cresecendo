"""
Crescendo ML — Feature Engineering
Creates and transforms features for ML model training.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder


class FeatureEngineer:
    """Feature engineering pipeline for song popularity prediction."""

    AUDIO_FEATURES = [
        "danceability", "energy", "loudness", "speechiness",
        "acousticness", "instrumentalness", "liveness", "valence",
        "tempo", "duration_ms",
    ]

    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()

    def load_data(self, filepath: str) -> pd.DataFrame:
        """Load raw data from CSV."""
        return pd.read_csv(filepath)

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean raw data — handle missing values, duplicates, outliers."""
        # Drop duplicates
        df = df.drop_duplicates(subset=["spotify_id"], keep="first")

        # Drop rows with missing critical features
        df = df.dropna(subset=["danceability", "energy", "valence"])

        # Fill remaining missing audio features with median
        for col in self.AUDIO_FEATURES:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())

        # Reset index
        df = df.reset_index(drop=True)

        return df

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create derived features from raw audio data."""
        # Interaction features
        df["energy_dance"] = df["energy"] * df["danceability"]
        df["mood_composite"] = (df["energy"] + df["danceability"] + df["valence"]) / 3
        df["emotional_intensity"] = abs(df["valence"] - 0.5) * 2
        df["acoustic_electronic"] = 1 - df["acousticness"]

        # Binary features
        df["is_high_energy"] = (df["energy"] > 0.7).astype(int)
        df["is_danceable"] = (df["danceability"] > 0.7).astype(int)
        df["is_positive"] = (df["valence"] > 0.5).astype(int)
        df["is_acoustic"] = (df["acousticness"] > 0.5).astype(int)

        # Tempo bins
        df["tempo_category"] = pd.cut(
            df["tempo"],
            bins=[0, 80, 110, 140, 200, 300],
            labels=["very_slow", "slow", "moderate", "fast", "very_fast"],
        )

        # Duration bins (in minutes)
        df["duration_min"] = df["duration_ms"] / 60000
        df["duration_category"] = pd.cut(
            df["duration_min"],
            bins=[0, 2, 3, 4, 5, 60],
            labels=["very_short", "short", "medium", "long", "very_long"],
        )

        # Log transform skewed features
        df["log_loudness"] = np.log1p(abs(df["loudness"]))
        df["log_tempo"] = np.log1p(df["tempo"])

        # Popularity target (binary for classification)
        if "popularity" in df.columns:
            df["is_popular"] = (df["popularity"] >= 70).astype(int)

        return df

    def scale_features(self, df: pd.DataFrame, feature_cols: list[str]) -> pd.DataFrame:
        """Apply StandardScaler to numeric features."""
        df[feature_cols] = self.scaler.fit_transform(df[feature_cols])
        return df

    def process_pipeline(self, input_path: str, output_path: str) -> pd.DataFrame:
        """Run the full preprocessing pipeline."""
        print("[1/3] Loading data...")
        df = self.load_data(input_path)
        print(f"   Loaded {len(df)} records")

        print("[2/3] Cleaning data...")
        df = self.clean(df)
        print(f"   {len(df)} records after cleaning")

        print("[3/3] Engineering features...")
        df = self.engineer_features(df)
        print(f"   {len(df.columns)} features created")

        # Save processed data
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"[OK] Saved processed data to {output_path}")

        return df


if __name__ == "__main__":
    engineer = FeatureEngineer()
    engineer.process_pipeline(
        input_path="data/raw/spotify_tracks.csv",
        output_path="data/processed/features.csv",
    )
