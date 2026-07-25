import pandas as pd
import numpy as np
from prophet import Prophet
import pickle
import json
from typing import Dict, Any, Tuple, Optional
import os

class ProphetDemandEngine:
    """
    Prophet Demand Forecasting Engine with Champion/Challenger Model Validation:
    Handles Prophet model training, weekly retraining with accuracy verification,
    90-day predictions with confidence bands, and MAPE/MAE evaluation math.
    """

    def train_model(self, df: pd.DataFrame, sku_id: str) -> Tuple[bytes, float, float]:
        """
        Trains a Prophet forecasting model on historical demand data (ds, y).
        Returns serialized model binary, MAPE %, and MAE.
        """
        if len(df) < 14:
            raise ValueError(f"Insufficient historical data for SKU {sku_id}. Require at least 14 days.")

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.95
        )
        model.add_country_holidays(country_name='US')
        model.fit(df)

        # Calculate in-sample accuracy metrics (MAPE & MAE)
        forecast = model.predict(df[['ds']])
        y_true = df['y'].values
        y_pred = forecast['yhat'].values

        mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1.0)))) * 100.0
        mae = float(np.mean(np.abs(y_true - y_pred)))

        model_bytes = pickle.dumps(model)
        return model_bytes, mape, mae

    def train_champion_challenger(
        self, 
        df: pd.DataFrame, 
        sku_id: str, 
        existing_model_bytes: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Champion/Challenger Model Selection:
        Trains a new Challenger model. If an existing Champion model exists in Redis,
        compares Challenger MAPE vs Champion MAPE. Promotes Challenger only if it achieves lower MAPE.
        """
        new_model_bytes, new_mape, new_mae = self.train_model(df, sku_id)

        if not existing_model_bytes:
            return {
                "action": "PROMOTED_INITIAL",
                "model_bytes": new_model_bytes,
                "champion_mape": new_mape,
                "challenger_mape": new_mape,
                "mae": new_mae,
                "reason": "Initial model training. Promoted to Champion."
            }

        try:
            old_model = pickle.loads(existing_model_bytes)
            old_forecast = old_model.predict(df[['ds']])
            y_true = df['y'].values
            y_old_pred = old_forecast['yhat'].values
            old_mape = float(np.mean(np.abs((y_true - y_old_pred) / np.maximum(y_true, 1.0)))) * 100.0
        except Exception:
            old_mape = 999.0

        if new_mape < old_mape:
            return {
                "action": "PROMOTED_CHALLENGER",
                "model_bytes": new_model_bytes,
                "champion_mape": new_mape,
                "previous_mape": old_mape,
                "accuracy_improvement": round(old_mape - new_mape, 2),
                "mae": new_mae,
                "reason": f"Challenger model achieved lower MAPE ({round(new_mape, 2)}% vs {round(old_mape, 2)}%). Promoted to Champion."
            }
        else:
            return {
                "action": "RETAINED_CHAMPION",
                "model_bytes": existing_model_bytes,
                "champion_mape": old_mape,
                "challenger_mape": new_mape,
                "mae": new_mae,
                "reason": f"Existing Champion model retained ({round(old_mape, 2)}% MAPE vs Challenger {round(new_mape, 2)}% MAPE)."
            }

    def predict_demand(self, model_bytes: bytes, horizon_days: int = 90) -> List[Dict[str, Any]]:
        """
        Generates N-day forward demand prediction with 95% confidence intervals.
        """
        model = pickle.loads(model_bytes)
        future = model.make_future_dataframe(periods=horizon_days)
        forecast = model.predict(future)

        predictions = []
        future_rows = forecast.tail(horizon_days)
        for _, row in future_rows.iterrows():
            predictions.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "point_estimate": max(0, int(round(row['yhat']))),
                "lower_bound": max(0, int(round(row['yhat_lower']))),
                "upper_bound": max(0, int(round(row['yhat_upper'])))
            })

        return predictions
