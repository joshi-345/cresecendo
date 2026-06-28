"""
Crescendo — Prediction Service
Orchestrates ML model inference for viral prediction.
"""

from typing import Optional
from app.ml_integration.model_loader import model_manager
from app.ml_integration.feature_extractor import FeatureExtractor


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
        2. Run XGBoost/LightGBM model
        3. Post-process results
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
            # Fallback: heuristic prediction
            return self._heuristic_prediction(audio_features)

        prediction = model.predict_proba([features])[0]

        # Step 3: Post-process
        viral_score = float(prediction[1] * 100)
        confidence = float(max(prediction))

        return {
            "viral_score": round(viral_score, 1),
            "success_probability": round(prediction[1], 3),
            "confidence_score": round(confidence, 3),
            "growth_forecast": self._generate_forecast(viral_score),
            "top_factors": self._get_feature_importance(features),
        }

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
            return "Limited viral potential — consider audience targeting"

    @staticmethod
    def _get_feature_importance(features: list) -> list[dict]:
        """Return top feature importances (placeholder)."""
        feature_names = ["Audio Energy", "Lyric Sentiment", "Artist Momentum", "Genre Trend", "Social Buzz"]
        return [
            {"name": name, "impact": round(80 + i * -5)}
            for i, name in enumerate(feature_names)
        ]


# Singleton
prediction_service = PredictionService()
