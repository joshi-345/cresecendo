"""
Crescendo ML — Trend Forecaster Training
Sklearn-based genre popularity trend forecaster.
Uses rolling statistics and linear regression to predict genre momentum.
"""

import yaml
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.linear_model import Ridge
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def load_config() -> dict:
    """Load training configuration."""
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)


def build_genre_trend_features(raw_path: str = "data/raw/spotify_tracks.csv") -> pd.DataFrame:
    """
    Build genre-level trend features from the raw Spotify data.
    Creates aggregated statistics per genre that can be used
    to predict genre momentum / popularity trends.
    """
    df = pd.read_csv(raw_path)

    if "genre" not in df.columns:
        raise ValueError("No 'genre' column in raw data")

    audio_cols = [
        "danceability", "energy", "loudness", "speechiness",
        "acousticness", "instrumentalness", "liveness", "valence",
        "tempo", "duration_ms", "popularity",
    ]

    # Aggregate per genre
    genre_stats = df.groupby("genre")[audio_cols].agg(["mean", "std", "median"]).reset_index()
    genre_stats.columns = ["genre"] + [
        f"{col}_{stat}" for col, stat in genre_stats.columns[1:]
    ]

    # Add genre size (number of tracks)
    genre_counts = df.groupby("genre").size().reset_index(name="track_count")
    genre_stats = genre_stats.merge(genre_counts, on="genre")

    # Add popularity distribution features
    pop_quantiles = df.groupby("genre")["popularity"].quantile([0.25, 0.75]).unstack()
    pop_quantiles.columns = ["popularity_q25", "popularity_q75"]
    pop_quantiles = pop_quantiles.reset_index()
    genre_stats = genre_stats.merge(pop_quantiles, on="genre")

    # Popularity IQR as a "spread" feature
    genre_stats["popularity_iqr"] = genre_stats["popularity_q75"] - genre_stats["popularity_q25"]

    # Fill NaN std values (genres with 1 track)
    genre_stats = genre_stats.fillna(0)

    return genre_stats


def train_trend_forecaster():
    """
    Train a trend forecaster that predicts genre popularity scores.
    Uses genre-level aggregated audio features to predict average popularity.
    """
    config = load_config()
    tf_config = config["trend_forecaster"]

    print("[*] Training Trend Forecaster...")
    print("=" * 60)

    # Build features
    print("    Building genre-level trend features...")
    genre_df = build_genre_trend_features()
    print(f"    Genres: {len(genre_df)}")
    print(f"    Features per genre: {len(genre_df.columns) - 1}")

    # Target: mean popularity of the genre
    target_col = "popularity_mean"
    feature_cols = [
        c for c in genre_df.columns
        if c not in ("genre", target_col)
    ]

    X = genre_df[feature_cols].to_numpy(dtype=np.float64)
    y = genre_df[target_col].to_numpy(dtype=np.float64)
    genres = genre_df["genre"].to_numpy(dtype=object)

    # Handle NaN/inf
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Encode genre labels for later lookup
    label_encoder = LabelEncoder()
    label_encoder.fit(genres)

    # Split
    X_train, X_test, y_train, y_test, genres_train, genres_test = train_test_split(
        X_scaled, y, genres, test_size=0.2, random_state=42,
    )

    # Train Ridge regression (robust for small datasets)
    print("    Training Ridge regression model...")
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)

    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\n    Results:")
    print(f"      RMSE: {rmse:.4f}")
    print(f"      MAE:  {mae:.4f}")
    print(f"      R2:   {r2:.4f}")

    # Show some predictions vs actual
    print(f"\n    Sample predictions (genre: actual -> predicted):")
    for i in range(min(10, len(y_test))):
        print(f"      {genres_test[i]:20s}  actual={y_test[i]:.1f}  pred={y_pred[i]:.1f}")

    # Save model bundle
    model_dir = Path("saved_models")
    model_dir.mkdir(parents=True, exist_ok=True)

    model_bundle = {
        "model": model,
        "scaler": scaler,
        "label_encoder": label_encoder,
        "feature_cols": feature_cols,
        "genre_features": genre_df,  # Store precomputed genre stats for inference
    }
    model_path = model_dir / "trend_forecaster.pkl"
    joblib.dump(model_bundle, model_path)
    print(f"\n[OK] Trend forecaster saved to {model_path}")

    # Save metadata
    metadata = {
        "model_type": "Ridge",
        "rmse": float(rmse),
        "mae": float(mae),
        "r2": float(r2),
        "n_genres": len(genres),
        "n_features": len(feature_cols),
        "feature_names": feature_cols,
        "forecast_periods": tf_config["forecast_periods"],
        "trained_at": datetime.now().isoformat(),
    }
    joblib.dump(metadata, model_dir / "trend_forecaster_metadata.pkl")

    return model_bundle, metadata


if __name__ == "__main__":
    train_trend_forecaster()
