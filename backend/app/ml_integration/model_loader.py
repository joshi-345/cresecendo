"""
Crescendo — ML Model Loader
Loads serialized ML models at application startup.
"""

import os
from typing import Optional, Any
from pathlib import Path

import joblib

from app.core.config import settings


class ModelManager:
    """Manages loading and caching of ML models."""

    def __init__(self):
        self._models: dict[str, Any] = {}
        self._model_dir = Path(settings.MODEL_PATH)

    def load_all(self):
        """Load all available models from the model directory."""
        if not self._model_dir.exists():
            print(f"[ModelManager] Model directory not found: {self._model_dir}")
            return

        model_files = {
            "viral_predictor": "viral_predictor.pkl",
            "genre_classifier": "genre_classifier.pkl",
            "sentiment_model": "sentiment_model.pkl",
            "trend_forecaster": "trend_forecaster.pkl",
        }

        for name, filename in model_files.items():
            filepath = self._model_dir / filename
            if filepath.exists():
                try:
                    self._models[name] = joblib.load(filepath)
                    print(f"[ModelManager] ✓ Loaded {name} from {filepath}")
                except Exception as e:
                    print(f"[ModelManager] ✗ Failed to load {name}: {e}")
            else:
                print(f"[ModelManager] ⊘ Model not found: {filename}")

    def get_model(self, name: str) -> Optional[Any]:
        """Get a loaded model by name."""
        return self._models.get(name)

    def is_loaded(self, name: str) -> bool:
        """Check if a model is loaded."""
        return name in self._models

    @property
    def loaded_models(self) -> list[str]:
        """List all loaded model names."""
        return list(self._models.keys())


# Singleton
model_manager = ModelManager()
