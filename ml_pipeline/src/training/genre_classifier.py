"""
Crescendo ML — Genre Classifier Training
Trains a sklearn-based classifier for music genre classification from audio features.
Uses a Random Forest + LabelEncoder approach for robust multi-class classification.
"""

import yaml
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, top_k_accuracy_score


AUDIO_FEATURES = [
    "danceability", "energy", "loudness", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence",
    "tempo", "duration_ms",
]

ENGINEERED_FEATURES = [
    "energy_dance", "mood_composite", "emotional_intensity",
    "is_high_energy", "is_danceable", "is_positive",
]


def load_config() -> dict:
    """Load training configuration."""
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)


def prepare_genre_data(min_samples: int = 50) -> tuple:
    """
    Load processed features and prepare for genre classification.
    Filters out genres with too few samples for reliable training.
    """
    df = pd.read_csv("data/processed/features.csv")

    if "genre" not in df.columns:
        raise ValueError("No 'genre' column found in features.csv")

    # Filter out genres with too few samples
    genre_counts = df["genre"].value_counts()
    valid_genres = genre_counts[genre_counts >= min_samples].index
    df = df[df["genre"].isin(valid_genres)].copy()

    print(f"    Genres with >= {min_samples} samples: {len(valid_genres)}")
    print(f"    Total samples: {len(df)}")

    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["genre"])

    # Select features
    feature_cols = [f for f in AUDIO_FEATURES + ENGINEERED_FEATURES if f in df.columns]
    X = df[feature_cols].values

    # Handle any NaN
    X = np.nan_to_num(X, nan=0.0)

    return X, y, feature_cols, label_encoder


def train_genre_classifier():
    """Train the genre classification model."""
    config = load_config()
    gc_config = config["genre_classifier"]

    print("[*] Training Genre Classifier...")
    print("=" * 60)

    # Prepare data
    X, y, feature_cols, label_encoder = prepare_genre_data(min_samples=50)
    num_classes = len(label_encoder.classes_)
    print(f"    Features: {len(feature_cols)}")
    print(f"    Classes:  {num_classes}")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y,
    )

    # Train Random Forest (fast, handles many classes well)
    # NOTE: max_samples=0.3 limits each tree to 30% of data, keeping pkl < 100 MB
    print("\n    Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        max_features="sqrt",
        max_samples=0.3,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    # Top-5 accuracy (more meaningful for 100+ classes)
    top5_accuracy = top_k_accuracy_score(y_test, y_prob, k=min(5, num_classes))

    print(f"\n    Results:")
    print(f"      Accuracy (top-1): {accuracy:.4f}")
    print(f"      Accuracy (top-5): {top5_accuracy:.4f}")

    # Show per-class report for top 10 genres
    report = classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )

    # Sort by f1-score descending, show top 10
    class_scores = {
        k: v for k, v in report.items()
        if k not in ("accuracy", "macro avg", "weighted avg")
    }
    top_classes = sorted(class_scores.items(), key=lambda x: x[1]["f1-score"], reverse=True)[:10]
    print(f"\n    Top 10 genres by F1-score:")
    for genre, scores in top_classes:
        print(f"      {genre:20s}  f1={scores['f1-score']:.3f}  support={scores['support']}")

    # Feature importance
    importances = model.feature_importances_
    imp_df = pd.DataFrame({
        "feature": feature_cols,
        "importance": importances,
    }).sort_values("importance", ascending=False)
    print(f"\n    Feature Importance:")
    print(imp_df.to_string(index=False))

    # Save model + label encoder + metadata
    model_dir = Path("saved_models")
    model_dir.mkdir(parents=True, exist_ok=True)

    model_bundle = {
        "model": model,
        "label_encoder": label_encoder,
        "feature_cols": feature_cols,
        "classes": list(label_encoder.classes_),
    }
    model_path = model_dir / "genre_classifier.pkl"
    joblib.dump(model_bundle, model_path)
    print(f"\n[OK] Genre classifier saved to {model_path}")

    # Save metadata
    metadata = {
        "model_type": "RandomForestClassifier",
        "accuracy_top1": float(accuracy),
        "accuracy_top5": float(top5_accuracy),
        "num_classes": num_classes,
        "n_features": len(feature_cols),
        "feature_names": feature_cols,
        "genre_labels": list(label_encoder.classes_),
        "trained_at": datetime.now().isoformat(),
    }
    joblib.dump(metadata, model_dir / "genre_classifier_metadata.pkl")

    return model_bundle, metadata


if __name__ == "__main__":
    train_genre_classifier()
