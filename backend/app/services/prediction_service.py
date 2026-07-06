"""
Crescendo — Prediction Service
Orchestrates ML model inference for viral prediction, genre classification,
and feature importance extraction.
"""

from typing import Optional
import numpy as np
from app.ml_integration.model_loader import model_manager
from app.ml_integration.feature_extractor import FeatureExtractor


# Human-readable names for the 16 features (10 audio + 6 engineered)
FEATURE_DISPLAY_NAMES = [
    "Danceability", "Energy", "Loudness", "Speechiness",
    "Acousticness", "Instrumentalness", "Liveness", "Valence",
    "Tempo", "Duration",
    "Energy x Dance", "Mood Composite", "Emotional Intensity",
    "High Energy Flag", "Danceable Flag", "Positive Flag",
]


class PredictionService:
    """Orchestrates the viral prediction pipeline."""

    def __init__(self):
        self.feature_extractor = FeatureExtractor()

    async def predict_virality(
        self,
        audio_features: dict,
        artist_metrics: Optional[dict] = None,
        social_signals: Optional[dict] = None,
    ) -> dict:
        """
        Run the viral prediction pipeline:
        1. Extract & engineer features
        2. Run XGBoost model
        3. Extract real feature importances
        4. Post-process results
        """
        # Step 1: Feature engineering
        features = self.feature_extractor.extract(
            audio_features=audio_features,
            artist_metrics=artist_metrics or {},
            social_signals=social_signals or {},
        )

        # Step 2: Model inference
        model = model_manager.get_model("viral_predictor")
        if model is None:
            return self._heuristic_prediction(audio_features)

        prediction = model.predict_proba([features])[0]

        # Step 3: Post-process
        viral_score = float(prediction[1] * 100)
        confidence = float(max(prediction))

        return {
            "viral_score": round(viral_score, 1),
            "success_probability": round(float(prediction[1]), 3),
            "confidence_score": round(float(confidence), 3),
            "growth_forecast": self._generate_forecast(viral_score),
            "top_factors": self._get_real_feature_importance(model, features),
        }

    def predict_genre(self, audio_features: dict) -> list[dict]:
        """
        Predict the genre of a song using the genre classifier model.
        Returns top-3 genre predictions with confidence scores.
        """
        bundle = model_manager.get_model("genre_classifier")
        if bundle is None:
            return []

        model = bundle["model"]
        label_encoder = bundle["label_encoder"]

        features = self.feature_extractor.extract(audio_features)

        try:
            proba = model.predict_proba([features])[0]
            top_indices = np.argsort(proba)[::-1][:3]

            return [
                {
                    "genre": label_encoder.inverse_transform([idx])[0],
                    "confidence": round(float(proba[idx]) * 100, 1),
                }
                for idx in top_indices
            ]
        except Exception as e:
            print(f"[PredictionService] Genre prediction failed: {e}")
            return []

    def _heuristic_prediction(self, audio_features: dict) -> dict:
        """Fallback heuristic when ML model is not loaded."""
        energy = audio_features.get("energy", 0.5)
        danceability = audio_features.get("danceability", 0.5)
        valence = audio_features.get("valence", 0.5)

        score = (energy * 30 + danceability * 40 + valence * 30)

        return {
            "viral_score": round(score, 1),
            "success_probability": round(score / 100, 3),
            "confidence_score": 0.65,
            "growth_forecast": self._generate_forecast(score),
            "top_factors": [
                {"name": "Danceability", "impact": round(danceability * 100)},
                {"name": "Energy", "impact": round(energy * 100)},
                {"name": "Valence", "impact": round(valence * 100)},
            ],
        }

    @staticmethod
    def _generate_forecast(score: float) -> str:
        if score >= 80:
            return "Exponential growth expected within 2-4 weeks"
        elif score >= 60:
            return "Strong growth potential in 4-8 weeks"
        elif score >= 40:
            return "Moderate growth with targeted promotion"
        else:
            return "Limited viral potential - consider audience targeting"

    @staticmethod
    def _get_real_feature_importance(model, features: list) -> list[dict]:
        """
        Extract actual feature importances from the XGBoost model
        and combine with the input feature values for context.
        """
        try:
            importances = model.feature_importances_
            n_features = min(len(importances), len(FEATURE_DISPLAY_NAMES), len(features))

            feature_data = []
            for i in range(n_features):
                feature_data.append({
                    "name": FEATURE_DISPLAY_NAMES[i],
                    "importance": float(importances[i]),
                    "value": float(features[i]),
                })

            # Sort by importance descending, return top 5
            feature_data.sort(key=lambda x: x["importance"], reverse=True)

            return [
                {
                    "name": f["name"],
                    "impact": round(f["importance"] * 100, 1),
                }
                for f in feature_data[:5]
            ]
        except Exception:
            # Fallback if feature importance extraction fails
            return [
                {"name": "Audio Energy", "impact": 80},
                {"name": "Danceability", "impact": 75},
                {"name": "Mood Composite", "impact": 70},
                {"name": "Valence", "impact": 65},
                {"name": "Tempo", "impact": 60},
            ]


# Singleton
prediction_service = PredictionService()
