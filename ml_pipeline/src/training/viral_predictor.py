"""
Crescendo ML — Viral Song Predictor Training
Trains XGBoost/LightGBM ensemble for viral prediction.
"""

import yaml
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import xgboost as xgb


def load_config() -> dict:
    """Load training configuration."""
    with open("config.yaml", "r") as f:
        return yaml.safe_load(f)


def prepare_data(config: dict) -> tuple:
    """Load and prepare training data."""
    df = pd.read_csv("data/processed/features.csv")

    # Feature columns
    audio_features = config["viral_predictor"]["features"]["audio"]
    engineered_features = [
        "energy_dance", "mood_composite", "emotional_intensity",
        "is_high_energy", "is_danceable", "is_positive",
    ]

    feature_cols = [f for f in audio_features + engineered_features if f in df.columns]
    target_col = "is_popular"

    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset")

    X = df[feature_cols].values
    y = df[target_col].values

    return X, y, feature_cols


def train_model(config: dict):
    """Train the viral prediction model."""
    print("[*] Training Viral Predictor...")
    print("=" * 60)

    # Prepare data
    X, y, feature_cols = prepare_data(config)
    print(f"    Dataset: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"    Positive class ratio: {y.mean():.2%}")

    # Split
    hp = config["viral_predictor"]["hyperparameters"]
    train_config = config["viral_predictor"]["training"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=train_config["test_size"],
        random_state=train_config["random_state"],
        stratify=y,
    )

    # Calculate class balance weight (negative:positive ratio)
    pos_ratio = y_train.mean()
    scale_weight = round((1 - pos_ratio) / pos_ratio) if pos_ratio > 0 else 1
    print(f"    Class balance weight: {scale_weight}")

    # Train XGBoost
    model = xgb.XGBClassifier(
        n_estimators=hp["n_estimators"],
        max_depth=hp["max_depth"],
        learning_rate=hp["learning_rate"],
        subsample=hp["subsample"],
        colsample_bytree=hp["colsample_bytree"],
        min_child_weight=hp["min_child_weight"],
        reg_alpha=hp["reg_alpha"],
        reg_lambda=hp["reg_lambda"],
        scale_pos_weight=scale_weight,
        random_state=train_config["random_state"],
        eval_metric="auc",
        use_label_encoder=False,
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=50,
    )

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_prob)

    print(f"\n    Results:")
    print(f"   Accuracy: {accuracy:.4f}")
    print(f"   AUC-ROC:  {auc_roc:.4f}")
    print(f"\n{classification_report(y_test, y_pred)}")

    # Cross-validation
    cv_scores = cross_val_score(
        model, X, y, cv=train_config["cv_folds"], scoring="roc_auc"
    )
    print(f"    CV AUC-ROC: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # Feature importance
    importances = model.feature_importances_
    importance_df = pd.DataFrame({
        "feature": feature_cols,
        "importance": importances,
    }).sort_values("importance", ascending=False)
    print(f"\n    Top Features:")
    print(importance_df.head(10).to_string(index=False))

    # Save model
    model_dir = Path("saved_models")
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "viral_predictor.pkl"
    joblib.dump(model, model_path)
    print(f"\n[OK] Model saved to {model_path}")

    # Save metadata
    metadata = {
        "model_type": "XGBClassifier",
        "accuracy": float(accuracy),
        "auc_roc": float(auc_roc),
        "cv_auc_mean": float(cv_scores.mean()),
        "cv_auc_std": float(cv_scores.std()),
        "n_features": len(feature_cols),
        "feature_names": feature_cols,
        "trained_at": datetime.now().isoformat(),
    }
    joblib.dump(metadata, model_dir / "viral_predictor_metadata.pkl")

    return model, metadata


if __name__ == "__main__":
    config = load_config()
    train_model(config)
