"""
Crescendo ML — Evaluation Metrics
Model accuracy, AUC-ROC, F1, RMSE calculations.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
    confusion_matrix,
    classification_report,
)


def classification_metrics(y_true, y_pred, y_prob=None) -> dict:
    """Calculate comprehensive classification metrics."""
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average="weighted", zero_division=0),
        "recall": recall_score(y_true, y_pred, average="weighted", zero_division=0),
        "f1_score": f1_score(y_true, y_pred, average="weighted", zero_division=0),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }

    if y_prob is not None:
        try:
            metrics["auc_roc"] = roc_auc_score(y_true, y_prob)
        except ValueError:
            metrics["auc_roc"] = None

    return metrics


def regression_metrics(y_true, y_pred) -> dict:
    """Calculate regression metrics for trend forecasting."""
    return {
        "mse": mean_squared_error(y_true, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "mae": mean_absolute_error(y_true, y_pred),
        "mape": np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1e-10))) * 100,
    }


def print_evaluation_report(y_true, y_pred, y_prob=None, model_name: str = "Model"):
    """Print a formatted evaluation report."""
    print(f"\n{'=' * 60}")
    print(f"📊 {model_name} — Evaluation Report")
    print(f"{'=' * 60}")

    metrics = classification_metrics(y_true, y_pred, y_prob)

    print(f"\n  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1 Score:  {metrics['f1_score']:.4f}")

    if metrics.get("auc_roc") is not None:
        print(f"  AUC-ROC:   {metrics['auc_roc']:.4f}")

    print(f"\n{classification_report(y_true, y_pred)}")

    return metrics
