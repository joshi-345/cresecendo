"""
Crescendo ML — Sentiment Model Training
Fine-tunes DistilBERT for music lyrics emotion classification (8 classes).

Steps:
  1. Download lyrics dataset (via lyrics_downloader.py)
  2. Fine-tune distilbert-base-uncased
  3. Save model + tokenizer to saved_models/
"""

import yaml
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report


EMOTION_LABELS = [
    "happiness", "sadness", "anger", "love",
    "fear", "hope", "nostalgia", "excitement",
]

ML_ROOT = Path(__file__).resolve().parents[2]


class LyricsDataset(Dataset):
    """PyTorch dataset for lyrics emotion classification."""

    def __init__(self, texts: list[str], labels: list[int], tokenizer, max_length: int = 256):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


def compute_metrics(eval_pred):
    """Compute metrics for Trainer evaluation."""
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc = accuracy_score(labels, preds)
    f1 = f1_score(labels, preds, average="weighted", zero_division=0)
    return {"accuracy": acc, "f1": f1}


def load_config() -> dict:
    """Load training configuration."""
    config_path = ML_ROOT / "config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def prepare_lyrics_data(max_samples_per_class: int = 5000):
    """
    Load lyrics emotion data. If not present, download it first.
    Balances classes by capping samples per emotion.
    """
    data_path = ML_ROOT / "data" / "raw" / "lyrics_emotions.csv"

    if not data_path.exists():
        print("    Lyrics dataset not found. Downloading...")
        from src.data_collection.lyrics_downloader import download_lyrics_dataset
        download_lyrics_dataset()

    df = pd.read_csv(data_path)
    print(f"    Total lyrics: {len(df)}")

    # Balance classes by downsampling
    balanced_dfs = []
    for emotion in EMOTION_LABELS:
        emotion_df = df[df["emotion"] == emotion]
        if len(emotion_df) > max_samples_per_class:
            emotion_df = emotion_df.sample(n=max_samples_per_class, random_state=42)
        balanced_dfs.append(emotion_df)

    df = pd.concat(balanced_dfs, ignore_index=True)
    print(f"    After balancing: {len(df)}")

    # Print distribution
    for emotion in EMOTION_LABELS:
        count = len(df[df["emotion"] == emotion])
        print(f"      {emotion:15s} {count:6d}")

    texts = df["text"].tolist()
    labels = df["label"].astype(int).tolist()

    return texts, labels


def train_sentiment_model():
    """Fine-tune DistilBERT for music emotion classification."""
    config = load_config()
    sm_config = config["sentiment_model"]

    print("[*] Training Sentiment Model (DistilBERT)...")
    print("=" * 60)
    print(f"    Base model: {sm_config['base_model']}")
    print(f"    Labels: {', '.join(sm_config['labels'])}")

    # Check device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"    Device: {device}")

    # Load data
    print("\n    Loading lyrics data...")
    texts, labels = prepare_lyrics_data()

    # Split
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=labels,
    )
    print(f"\n    Train: {len(train_texts)}, Val: {len(val_texts)}")

    # Load tokenizer and model
    print(f"\n    Loading {sm_config['base_model']}...")
    tokenizer = AutoTokenizer.from_pretrained(sm_config["base_model"])
    model = AutoModelForSequenceClassification.from_pretrained(
        sm_config["base_model"],
        num_labels=sm_config["num_labels"],
        problem_type="single_label_classification",
    )

    param_count = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"    Parameters: {param_count:,} total, {trainable:,} trainable")

    # Create datasets
    train_dataset = LyricsDataset(train_texts, train_labels, tokenizer, max_length=sm_config["training"]["max_length"])
    val_dataset = LyricsDataset(val_texts, val_labels, tokenizer, max_length=sm_config["training"]["max_length"])

    # Training arguments
    output_dir = ML_ROOT / "saved_models" / "sentiment_training"
    training_args = TrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=sm_config["training"]["epochs"],
        per_device_train_batch_size=sm_config["training"]["batch_size"],
        per_device_eval_batch_size=sm_config["training"]["batch_size"],
        learning_rate=float(sm_config["training"]["learning_rate"]),
        warmup_steps=sm_config["training"]["warmup_steps"],
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        logging_steps=50,
        report_to="none",  # Don't use wandb/mlflow
        save_total_limit=2,
        fp16=torch.cuda.is_available(),
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )

    # Train
    print("\n    Starting training...")
    print("-" * 60)
    train_result = trainer.train()
    print("-" * 60)

    # Evaluate
    eval_result = trainer.evaluate()
    print(f"\n    Evaluation Results:")
    print(f"      Accuracy: {eval_result.get('eval_accuracy', 'N/A'):.4f}")
    print(f"      F1:       {eval_result.get('eval_f1', 'N/A'):.4f}")
    print(f"      Loss:     {eval_result.get('eval_loss', 'N/A'):.4f}")

    # Detailed predictions on val set
    predictions = trainer.predict(val_dataset)
    preds = np.argmax(predictions.predictions, axis=-1)
    print(f"\n    Classification Report:")
    print(classification_report(
        val_labels, preds,
        target_names=EMOTION_LABELS,
        zero_division=0,
    ))

    # Save model + tokenizer
    model_dir = ML_ROOT / "saved_models"
    model_save_path = model_dir / "sentiment_model"
    model_save_path.mkdir(parents=True, exist_ok=True)

    trainer.save_model(str(model_save_path))
    tokenizer.save_pretrained(str(model_save_path))
    print(f"[OK] Sentiment model saved to {model_save_path}")

    # Also save as a pkl bundle for the ModelManager
    model_bundle = {
        "model_path": str(model_save_path),
        "label_names": EMOTION_LABELS,
        "base_model": sm_config["base_model"],
        "max_length": sm_config["training"]["max_length"],
    }
    joblib.dump(model_bundle, model_dir / "sentiment_model.pkl")

    # Save metadata
    metadata = {
        "model_type": "DistilBERT",
        "base_model": sm_config["base_model"],
        "accuracy": float(eval_result.get("eval_accuracy", 0)),
        "f1": float(eval_result.get("eval_f1", 0)),
        "loss": float(eval_result.get("eval_loss", 0)),
        "num_labels": sm_config["num_labels"],
        "label_names": EMOTION_LABELS,
        "train_samples": len(train_texts),
        "val_samples": len(val_texts),
        "epochs_trained": train_result.metrics.get("epoch", sm_config["training"]["epochs"]),
        "trained_at": datetime.now().isoformat(),
    }
    joblib.dump(metadata, model_dir / "sentiment_model_metadata.pkl")

    return model_bundle, metadata


if __name__ == "__main__":
    train_sentiment_model()
