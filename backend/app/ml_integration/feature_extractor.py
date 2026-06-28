"""
Crescendo — Feature Extractor
Transforms raw data into model input features.
Aligned to the 16 features used during model training.
"""

import numpy as np
from typing import Optional


class FeatureExtractor:
    """Transforms raw song/artist data into ML model features."""

    # Audio feature keys — must match training feature order exactly
    AUDIO_FEATURE_KEYS = [
        "danceability", "energy", "loudness", "speechiness",
        "acousticness", "instrumentalness", "liveness", "valence",
        "tempo", "duration_ms",
    ]

    def extract(
        self,
        audio_features: dict,
        artist_metrics: Optional[dict] = None,
        social_signals: Optional[dict] = None,
    ) -> list[float]:
        """
        Extract and engineer features from raw data.
        Returns a 16-element feature vector matching the trained model:
          10 audio features + 6 engineered features.
        """
        features = []

        # 10 audio features
        for key in self.AUDIO_FEATURE_KEYS:
            features.append(float(audio_features.get(key, 0.0)))

        # 6 engineered features (must match feature_engineering.py)
        features.extend(self._engineer_features(audio_features))

        return features

    def _engineer_features(self, audio: dict) -> list[float]:
        """
        Create derived features from raw audio data.
        Must produce exactly 6 features matching the training pipeline:
          energy_dance, mood_composite, emotional_intensity,
          is_high_energy, is_danceable, is_positive
        """
        energy = float(audio.get("energy", 0.5))
        danceability = float(audio.get("danceability", 0.5))
        valence = float(audio.get("valence", 0.5))

        return [
            energy * danceability,                    # energy_dance
            (energy + danceability + valence) / 3,    # mood_composite
            abs(valence - 0.5) * 2,                   # emotional_intensity
            1.0 if energy > 0.7 else 0.0,             # is_high_energy
            1.0 if danceability > 0.6 else 0.0,       # is_danceable
            1.0 if valence > 0.5 else 0.0,            # is_positive
        ]

    @staticmethod
    def normalize(features: list[float]) -> list[float]:
        """Min-max normalize feature vector."""
        arr = np.array(features)
        min_val = arr.min()
        max_val = arr.max()
        if max_val - min_val == 0:
            return [0.0] * len(features)
        return ((arr - min_val) / (max_val - min_val)).tolist()
