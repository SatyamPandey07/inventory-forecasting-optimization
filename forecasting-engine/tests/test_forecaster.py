import pytest
from datetime import datetime, timedelta
from forecaster import ProphetDemandEngine

@pytest.fixture
def sample_history():
    """Generates 30 days of sample historical demand."""
    start_date = datetime(2026, 1, 1)
    return [
        {"ds": (start_date + timedelta(days=i)).strftime('%Y-%m-%d'), "y": 30 + (i % 7) * 2}
        for i in range(30)
    ]

def test_prophet_train_and_predict(sample_history):
    engine = ProphetDemandEngine()
    model_bytes, summary = engine.train(sample_history)

    assert model_bytes is not None
    assert len(model_bytes) > 0
    assert summary["training_samples"] == 30

    # Predict next 90 days
    predictions = engine.predict(model_bytes, horizon_days=90)

    assert len(predictions) == 90
    for p in predictions:
        assert "ds" in p
        assert "point_estimate" in p
        assert "lower_bound" in p
        assert "upper_bound" in p
        assert p["point_estimate"] >= 0
        assert p["lower_bound"] <= p["upper_bound"]

def test_calculate_accuracy():
    engine = ProphetDemandEngine()
    actuals = [100.0, 150.0, 200.0, 120.0]
    predictions = [110.0, 140.0, 190.0, 130.0]

    metrics = engine.calculate_accuracy(actuals, predictions)

    assert "mape" in metrics
    assert "mae" in metrics
    assert metrics["mae"] == 10.0 # (|10| + |-10| + |-10| + |10|) / 4 = 10
    assert metrics["mape"] > 0
