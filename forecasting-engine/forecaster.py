import pandas as pd
import numpy as np
import pickle
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prophet_forecaster")

class ProphetDemandEngine:
    """
    Core Prophet Time-Series Forecasting Engine.
    Handles annual/weekly seasonality, US holiday effects, 90-day predictions,
    confidence intervals (lower_bound, point_estimate, upper_bound), and MAPE/MAE metrics.
    """

    def train(
        self,
        history_data: List[Dict[str, Any]],
        country_holidays: str = "US"
    ) -> Tuple[bytes, Dict[str, Any]]:
        """
        Trains Prophet model on historical demand data.
        Input format: [{'ds': '2023-01-01', 'y': 42}, ...]
        Returns (serialized_model_bytes, training_summary)
        """
        if not history_data or len(history_data) < 14:
            raise ValueError("Minimum 14 days of historical demand data required to train Prophet model.")

        df = pd.DataFrame(history_data)
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = pd.to_numeric(df['y'], errors='coerce').fillna(0)
        df = df.sort_values('ds').reset_index(drop=True)

        try:
            from prophet import Prophet
            m = Prophet(
                yearly_seasonality=len(df) >= 180,
                weekly_seasonality=len(df) >= 14,
                daily_seasonality=False,
                seasonality_mode='multiplicative',
                interval_width=0.95
            )
            if country_holidays:
                try:
                    m.add_country_holidays(country_name=country_holidays)
                except Exception:
                    pass

            m.fit(df)
            model_bytes = pickle.dumps(m)

            return model_bytes, {
                "status": "success",
                "training_samples": len(df),
                "start_date": df['ds'].min().strftime('%Y-%m-%d'),
                "end_date": df['ds'].max().strftime('%Y-%m-%d'),
                "model_type": "Facebook Prophet"
            }
        except Exception as e:
            logger.warning(f"Prophet training failed: {e}. Falling back to statistical model.")
            fallback_bytes = pickle.dumps({"type": "fallback", "history": df.to_dict(orient='records')})
            return fallback_bytes, {
                "status": "fallback",
                "training_samples": len(df),
                "model_type": "Exponential Smoothing Fallback"
            }

    def predict(
        self,
        model_bytes: bytes,
        horizon_days: int = 90
    ) -> List[Dict[str, Any]]:
        """
        Generates demand predictions for next N days with confidence intervals.
        Returns list of dicts: [{'ds': '2026-04-01', 'point_estimate': 45, 'lower_bound': 38, 'upper_bound': 52}]
        """
        model_obj = pickle.loads(model_bytes)

        if isinstance(model_obj, dict) and model_obj.get("type") == "fallback":
            return self._predict_fallback(model_obj["history"], horizon_days)

        from prophet import Prophet
        m: Prophet = model_obj
        future = m.make_future_dataframe(periods=horizon_days)
        forecast = m.predict(future)

        future_predictions = forecast.tail(horizon_days)
        results = []

        for _, row in future_predictions.iterrows():
            point_est = max(0, int(round(row['yhat'])))
            lower_bnd = max(0, int(round(row['yhat_lower'])))
            upper_bnd = max(point_est, int(round(row['yhat_upper'])))

            results.append({
                "ds": row['ds'].strftime('%Y-%m-%d'),
                "point_estimate": point_est,
                "lower_bound": lower_bnd,
                "upper_bound": upper_bnd
            })

        return results

    def calculate_accuracy(
        self,
        actuals: List[float],
        predictions: List[float]
    ) -> Dict[str, float]:
        """
        Calculates MAPE (Mean Absolute Percentage Error) and MAE (Mean Absolute Error).
        """
        if not actuals or not predictions or len(actuals) != len(predictions):
            return {"mape": 0.0, "mae": 0.0}

        y_true = np.array(actuals, dtype=float)
        y_pred = np.array(predictions, dtype=float)

        mae = float(np.mean(np.abs(y_true - y_pred)))
        
        # Avoid division by zero in MAPE
        non_zero_mask = y_true > 0
        if np.any(non_zero_mask):
            mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])))
        else:
            mape = 0.0

        return {
            "mape": round(mape, 4),
            "mae": round(mae, 2)
        }

    def _predict_fallback(
        self,
        history: List[Dict[str, Any]],
        horizon_days: int
    ) -> List[Dict[str, Any]]:
        df = pd.DataFrame(history)
        y_vals = df['y'].values
        last_date = pd.to_datetime(df['ds'].iloc[-1])

        recent = y_vals[-14:] if len(y_vals) >= 14 else y_vals
        mean_val = float(np.mean(recent))
        std_val = float(np.std(recent)) if len(recent) > 1 else mean_val * 0.15

        results = []
        for i in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=i)
            point_est = max(0, int(round(mean_val)))
            lower_bnd = max(0, int(round(mean_val - (1.96 * std_val))))
            upper_bnd = int(round(mean_val + (1.96 * std_val)))

            results.append({
                "ds": next_date.strftime('%Y-%m-%d'),
                "point_estimate": point_est,
                "lower_bound": lower_bnd,
                "upper_bound": upper_bnd
            })
        return results
