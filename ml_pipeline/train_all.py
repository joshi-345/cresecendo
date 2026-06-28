"""
Crescendo ML Pipeline — Master Training Script
Runs the full pipeline: preprocessing -> training -> evaluation.

Usage:
    cd ml_pipeline
    python train_all.py
"""

import sys
import time
from pathlib import Path

# Ensure we're running from ml_pipeline directory
ML_ROOT = Path(__file__).resolve().parent
if ML_ROOT.name != "ml_pipeline":
    print(f"[ERROR] Run this script from the ml_pipeline directory.")
    sys.exit(1)


def run_phase(name: str, func):
    """Run a training phase with timing and error handling."""
    print(f"\n{'=' * 60}")
    print(f"  {name}")
    print(f"{'=' * 60}\n")

    start = time.time()
    try:
        result = func()
        elapsed = time.time() - start
        print(f"\n[OK] {name} completed in {elapsed:.1f}s")
        return result
    except Exception as e:
        elapsed = time.time() - start
        print(f"\n[FAIL] {name} failed after {elapsed:.1f}s: {e}")
        import traceback
        traceback.print_exc()
        return None


def phase_preprocessing():
    """Phase 1: Feature engineering."""
    from src.preprocessing.feature_engineering import FeatureEngineer

    engineer = FeatureEngineer()
    df = engineer.process_pipeline(
        input_path="data/raw/spotify_tracks.csv",
        output_path="data/processed/features.csv",
    )
    return df


def phase_viral_predictor():
    """Phase 2: Train viral predictor."""
    from src.training.viral_predictor import load_config, train_model

    config = load_config()
    model, metadata = train_model(config)
    return metadata


def phase_genre_classifier():
    """Phase 3: Train genre classifier."""
    from src.training.genre_classifier import train_genre_classifier

    bundle, metadata = train_genre_classifier()
    return metadata


def phase_trend_forecaster():
    """Phase 4: Train trend forecaster."""
    from src.training.trend_forecaster import train_trend_forecaster

    bundle, metadata = train_trend_forecaster()
    return metadata


def main():
    print("=" * 60)
    print("  CRESCENDO ML PIPELINE — Full Training Run")
    print("=" * 60)

    total_start = time.time()
    results = {}

    # Phase 1: Preprocessing
    results["preprocessing"] = run_phase(
        "Phase 1: Preprocessing & Feature Engineering",
        phase_preprocessing,
    )

    # Phase 2: Viral Predictor
    results["viral_predictor"] = run_phase(
        "Phase 2: Viral Predictor (XGBoost)",
        phase_viral_predictor,
    )

    # Phase 3: Genre Classifier
    results["genre_classifier"] = run_phase(
        "Phase 3: Genre Classifier (Random Forest)",
        phase_genre_classifier,
    )

    # Phase 4: Trend Forecaster
    results["trend_forecaster"] = run_phase(
        "Phase 4: Trend Forecaster (Ridge Regression)",
        phase_trend_forecaster,
    )

    # Summary
    total_elapsed = time.time() - total_start
    print(f"\n\n{'=' * 60}")
    print(f"  TRAINING SUMMARY")
    print(f"{'=' * 60}")
    print(f"  Total time: {total_elapsed:.1f}s\n")

    # Check saved models
    model_dir = Path("saved_models")
    expected_models = [
        "viral_predictor.pkl",
        "genre_classifier.pkl",
        "trend_forecaster.pkl",
    ]

    for model_file in expected_models:
        path = model_dir / model_file
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            print(f"  [OK]   {model_file} ({size_mb:.1f} MB)")
        else:
            print(f"  [MISS] {model_file}")

    # Print metrics
    print()
    if results.get("viral_predictor"):
        m = results["viral_predictor"]
        print(f"  Viral Predictor:  AUC={m.get('auc_roc', 'N/A'):.4f}  "
              f"Acc={m.get('accuracy', 'N/A'):.4f}")

    if results.get("genre_classifier"):
        m = results["genre_classifier"]
        print(f"  Genre Classifier: Top1={m.get('accuracy_top1', 'N/A'):.4f}  "
              f"Top5={m.get('accuracy_top5', 'N/A'):.4f}  "
              f"Classes={m.get('num_classes', 'N/A')}")

    if results.get("trend_forecaster"):
        m = results["trend_forecaster"]
        print(f"  Trend Forecaster: R2={m.get('r2', 'N/A'):.4f}  "
              f"RMSE={m.get('rmse', 'N/A'):.4f}")

    print(f"\n{'=' * 60}")
    print(f"  Pipeline complete!")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
