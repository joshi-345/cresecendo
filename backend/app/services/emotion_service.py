"""
Crescendo - Emotion Analysis Service
NLP pipeline for lyrics sentiment analysis.
"""

import hashlib
import json
import re
from typing import Any

import httpx

from app.core.config import settings


class EmotionService:
    """Analyzes lyrics for emotional content using local Ollama models."""

    EMOTION_LABELS = [
        "Happiness", "Sadness", "Anger", "Love",
        "Fear", "Hope", "Nostalgia", "Excitement",
    ]

    EMOTION_COLORS = {
        "Happiness": "#ffbe0b",
        "Sadness": "#3a86ff",
        "Anger": "#ff006e",
        "Love": "#ff6b6b",
        "Fear": "#8338ec",
        "Hope": "#06d6a0",
        "Nostalgia": "#fb5607",
        "Excitement": "#7c5cfc",
    }

    def __init__(self):
        self._model = None

    def _load_model(self):
        """Keep a lightweight marker for the configured local Ollama model."""
        self._model = settings.OLLAMA_SENTIMENT_MODEL

    def hash_lyrics(self, lyrics: str) -> str:
        """Generate a hash for lyrics caching."""
        return hashlib.sha256(lyrics.encode()).hexdigest()

    async def analyze(self, lyrics: str) -> dict:
        """
        Analyze lyrics for emotional content.
        Returns overall sentiment, emotion breakdown, and line-level analysis.
        """
        if self._model is None:
            self._load_model()

        lines = [line.strip() for line in lyrics.split("\n") if line.strip()]
        if not lines:
            return self._fallback_analysis("", [])

        try:
            return await self._analyze_with_ollama(lyrics, lines)
        except Exception:
            return self._fallback_analysis(lyrics, lines)

    async def _analyze_with_ollama(self, lyrics: str, lines: list[str]) -> dict:
        """Call a small local Ollama model and normalize its JSON response."""
        payload = {
            "model": settings.OLLAMA_SENTIMENT_MODEL,
            "prompt": self._build_prompt(lyrics, lines),
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,
                "num_predict": 700,
            },
        }

        async with httpx.AsyncClient(timeout=settings.OLLAMA_SENTIMENT_TIMEOUT) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate",
                json=payload,
            )
            response.raise_for_status()

        parsed = self._parse_json_response(response.json().get("response", ""))
        emotions = self._normalize_emotions(parsed.get("emotions", {}))
        line_analysis = self._normalize_line_analysis(parsed.get("line_analysis", []), lines)

        return {
            "overall_sentiment": parsed.get("overall_sentiment") or self._overall_sentiment(emotions),
            "emotions": [
                {"name": name, "value": value, "color": self.EMOTION_COLORS[name]}
                for name, value in emotions.items()
            ],
            "lyric_analysis": line_analysis,
            "lyrics_hash": self.hash_lyrics(lyrics),
        }

    def _build_prompt(self, lyrics: str, lines: list[str]) -> str:
        sample_lines = "\n".join(f"- {line}" for line in lines[:10])
        return f"""
You are a music lyrics emotion classifier.
Analyze the lyrics and return only valid JSON with this exact shape:
{{
  "overall_sentiment": "Positive | Negative | Mixed | Neutral",
  "emotions": {{
    "Happiness": 0,
    "Sadness": 0,
    "Anger": 0,
    "Love": 0,
    "Fear": 0,
    "Hope": 0,
    "Nostalgia": 0,
    "Excitement": 0
  }},
  "line_analysis": [
    {{"text": "lyric line", "emotion": "Happiness", "confidence": 0.85}}
  ]
}}

Rules:
- Emotion values must be numbers from 0 to 100.
- Use only these emotion labels: {", ".join(self.EMOTION_LABELS)}.
- Include analysis for these lines only:
{sample_lines}

Lyrics:
{lyrics[:5000]}
""".strip()

    def _parse_json_response(self, text: str) -> dict[str, Any]:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def _normalize_emotions(self, raw_emotions: dict[str, Any]) -> dict[str, float]:
        emotions = {}
        for label in self.EMOTION_LABELS:
            value = raw_emotions.get(label, raw_emotions.get(label.lower(), 0))
            try:
                number = float(value)
            except (TypeError, ValueError):
                number = 0.0
            emotions[label] = max(0.0, min(100.0, round(number, 1)))
        return emotions

    def _normalize_line_analysis(self, raw_lines: list[dict[str, Any]], lyrics_lines: list[str]) -> list[dict]:
        normalized = []
        for index, line in enumerate(lyrics_lines[:10]):
            raw = raw_lines[index] if index < len(raw_lines) and isinstance(raw_lines[index], dict) else {}
            emotion = raw.get("emotion", self.EMOTION_LABELS[index % len(self.EMOTION_LABELS)])
            if emotion not in self.EMOTION_LABELS:
                emotion = self.EMOTION_LABELS[index % len(self.EMOTION_LABELS)]
            try:
                confidence = float(raw.get("confidence", 0.65))
            except (TypeError, ValueError):
                confidence = 0.65
            normalized.append({
                "text": line,
                "emotion": emotion,
                "confidence": max(0.0, min(1.0, round(confidence, 2))),
            })
        return normalized

    def _overall_sentiment(self, emotions: dict[str, float]) -> str:
        positive_score = sum(emotions.get(e, 0) for e in ["Happiness", "Love", "Hope", "Excitement"])
        negative_score = sum(emotions.get(e, 0) for e in ["Sadness", "Anger", "Fear"])

        if abs(positive_score - negative_score) < 20:
            return "Mixed"
        return "Positive" if positive_score > negative_score else "Negative"

    def _fallback_analysis(self, lyrics: str, lines: list[str]) -> dict:
        """Small deterministic fallback when Ollama is unavailable."""
        positive_words = {"love", "hope", "dance", "dream", "happy", "alive", "light", "free"}
        negative_words = {"sad", "cry", "lost", "lonely", "fear", "angry", "dark", "broken"}
        words = re.findall(r"[a-z']+", lyrics.lower())
        positive_hits = sum(1 for word in words if word in positive_words)
        negative_hits = sum(1 for word in words if word in negative_words)

        emotions = {label: 25.0 for label in self.EMOTION_LABELS}
        emotions["Happiness"] = min(100.0, 35.0 + positive_hits * 8)
        emotions["Love"] = min(100.0, 30.0 + words.count("love") * 12)
        emotions["Hope"] = min(100.0, 30.0 + words.count("hope") * 12)
        emotions["Sadness"] = min(100.0, 30.0 + negative_hits * 8)
        emotions["Fear"] = min(100.0, 20.0 + words.count("fear") * 15)
        emotions["Anger"] = min(100.0, 20.0 + words.count("angry") * 15)
        emotions["Nostalgia"] = min(100.0, 25.0 + words.count("remember") * 12)
        emotions["Excitement"] = min(100.0, 25.0 + words.count("dance") * 12)

        line_analysis = [
            {
                "text": line,
                "emotion": self.EMOTION_LABELS[i % len(self.EMOTION_LABELS)],
                "confidence": 0.65,
            }
            for i, line in enumerate(lines[:10])
        ]

        return {
            "overall_sentiment": self._overall_sentiment(emotions),
            "emotions": [
                {"name": name, "value": value, "color": self.EMOTION_COLORS[name]}
                for name, value in emotions.items()
            ],
            "lyric_analysis": line_analysis,
            "lyrics_hash": self.hash_lyrics(lyrics),
        }


emotion_service = EmotionService()
