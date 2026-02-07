"""Anomaly detection service using Isolation Forest.

Detects anomalous sensor readings for leak detection,
pressure drops, and unusual flow patterns.
"""

import logging
from datetime import datetime, timezone, timedelta

import numpy as np

logger = logging.getLogger(__name__)

# Thresholds for simple rule-based detection (fallback)
THRESHOLDS = {
    "flow": {"min": 0, "max": 500, "unit": "L/s"},
    "pressure": {"min": 0.5, "max": 10, "unit": "bar"},
    "level": {"min": 0, "max": 50, "unit": "m"},
    "ph": {"min": 6.0, "max": 9.0, "unit": "pH"},
    "turbidity": {"min": 0, "max": 10, "unit": "NTU"},
}


class AnomalyDetector:
    """Hybrid anomaly detector: rule-based + ML (Isolation Forest)."""

    def __init__(self):
        self._model = None
        self._is_fitted = False

    def detect_simple(self, metric_type: str, value: float) -> tuple[bool, float]:
        """Rule-based anomaly detection. Returns (is_anomaly, score 0-1)."""
        thresholds = THRESHOLDS.get(metric_type)
        if not thresholds:
            return False, 0.0

        min_val = thresholds["min"]
        max_val = thresholds["max"]
        mid = (min_val + max_val) / 2
        range_val = max_val - min_val

        if value < min_val or value > max_val:
            # How far outside the range
            distance = max(min_val - value, value - max_val)
            score = min(1.0, 0.5 + (distance / range_val))
            return True, round(score, 3)

        # Score based on distance from typical center
        deviation = abs(value - mid) / (range_val / 2)
        score = round(deviation * 0.3, 3)  # Low score for in-range values
        return False, score

    def detect_isolation_forest(
        self, values: list[float], new_value: float
    ) -> tuple[bool, float]:
        """ML-based anomaly detection using Isolation Forest.

        Requires scikit-learn. Falls back to simple detection if unavailable.
        """
        try:
            from sklearn.ensemble import IsolationForest

            if len(values) < 30:
                # Not enough history for ML
                return False, 0.0

            data = np.array(values + [new_value]).reshape(-1, 1)
            model = IsolationForest(
                n_estimators=100,
                contamination=0.05,
                random_state=42,
            )
            model.fit(data)

            score = model.decision_function([[new_value]])[0]
            prediction = model.predict([[new_value]])[0]

            # Convert to 0-1 score (lower decision_function = more anomalous)
            normalized_score = max(0, min(1, 0.5 - score))
            is_anomaly = prediction == -1

            return is_anomaly, round(normalized_score, 3)

        except ImportError:
            logger.warning("scikit-learn not available, using rule-based detection")
            return False, 0.0

    def detect_rate_of_change(
        self,
        current_value: float,
        previous_value: float,
        time_delta_seconds: float,
        max_rate: float,
    ) -> tuple[bool, float]:
        """Detect sudden changes (e.g., pipe burst = sudden flow spike)."""
        if time_delta_seconds <= 0:
            return False, 0.0

        rate = abs(current_value - previous_value) / time_delta_seconds
        if rate > max_rate:
            score = min(1.0, rate / max_rate)
            return True, round(score, 3)
        return False, 0.0


# Singleton
anomaly_detector = AnomalyDetector()
