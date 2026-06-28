"""
Crescendo ML — Text Processor
Lyrics cleaning, tokenization, and preprocessing for NLP models.
"""

import re
from typing import Optional


class TextProcessor:
    """Preprocesses lyrics text for sentiment analysis."""

    # Common patterns to remove
    SECTION_PATTERN = re.compile(r"\[.*?\]")         # [Verse 1], [Chorus], etc.
    PARENTHETICAL = re.compile(r"\(.*?\)")            # (x2), (feat. ...), etc.
    MULTIPLE_SPACES = re.compile(r"\s+")
    MULTIPLE_NEWLINES = re.compile(r"\n{3,}")

    def clean_lyrics(self, lyrics: str) -> str:
        """Clean raw lyrics text."""
        # Remove section headers
        text = self.SECTION_PATTERN.sub("", lyrics)

        # Remove parentheticals
        text = self.PARENTHETICAL.sub("", text)

        # Normalize whitespace
        text = self.MULTIPLE_SPACES.sub(" ", text)
        text = self.MULTIPLE_NEWLINES.sub("\n\n", text)

        # Strip each line
        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines)

        return text.strip()

    def split_into_lines(self, lyrics: str) -> list[str]:
        """Split lyrics into individual lines, removing empty ones."""
        return [line.strip() for line in lyrics.split("\n") if line.strip()]

    def remove_stopwords(self, text: str, stopwords: Optional[set[str]] = None) -> str:
        """Remove common stopwords from text."""
        if stopwords is None:
            stopwords = {
                "the", "a", "an", "is", "it", "to", "in", "for",
                "on", "with", "at", "by", "from", "up", "of",
                "and", "or", "but", "not", "no",
            }
        words = text.lower().split()
        return " ".join(w for w in words if w not in stopwords)

    def extract_vocabulary(self, lyrics: str) -> dict:
        """Extract vocabulary statistics from lyrics."""
        words = lyrics.lower().split()
        unique_words = set(words)
        return {
            "total_words": len(words),
            "unique_words": len(unique_words),
            "lexical_diversity": len(unique_words) / max(len(words), 1),
            "avg_word_length": sum(len(w) for w in words) / max(len(words), 1),
        }

    def process(self, raw_lyrics: str) -> dict:
        """Full preprocessing pipeline."""
        cleaned = self.clean_lyrics(raw_lyrics)
        lines = self.split_into_lines(cleaned)
        vocab_stats = self.extract_vocabulary(cleaned)

        return {
            "cleaned_text": cleaned,
            "lines": lines,
            "line_count": len(lines),
            **vocab_stats,
        }


if __name__ == "__main__":
    processor = TextProcessor()
    sample = """
    [Verse 1]
    Dancing under neon lights, we own the night
    Hearts beating fast, the stars align (x2)

    [Chorus]
    We are the dreamers, we are the light
    Nothing can stop us, we'll take flight
    """
    result = processor.process(sample)
    print(result)
