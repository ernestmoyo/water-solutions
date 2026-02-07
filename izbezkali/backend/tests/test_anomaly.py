"""Anomaly detection service tests."""

from app.services.anomaly import anomaly_detector


def test_simple_detection_normal():
    is_anomaly, score = anomaly_detector.detect_simple("flow", 100)
    assert not is_anomaly
    assert 0 <= score <= 1


def test_simple_detection_anomaly_high():
    is_anomaly, score = anomaly_detector.detect_simple("flow", 600)
    assert is_anomaly
    assert score > 0.5


def test_simple_detection_anomaly_low():
    is_anomaly, score = anomaly_detector.detect_simple("pressure", -1)
    assert is_anomaly


def test_simple_detection_unknown_type():
    is_anomaly, score = anomaly_detector.detect_simple("unknown_metric", 42)
    assert not is_anomaly
    assert score == 0.0


def test_rate_of_change_normal():
    is_anomaly, score = anomaly_detector.detect_rate_of_change(
        current_value=100, previous_value=98, time_delta_seconds=60, max_rate=1.0
    )
    assert not is_anomaly


def test_rate_of_change_spike():
    is_anomaly, score = anomaly_detector.detect_rate_of_change(
        current_value=200, previous_value=50, time_delta_seconds=10, max_rate=5.0
    )
    assert is_anomaly
    assert score > 0.5
