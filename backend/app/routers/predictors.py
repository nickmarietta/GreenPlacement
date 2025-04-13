# predictor.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from ..ml.model_loader import models

router = APIRouter()

class WindInput(BaseModel):
    Wspd: float
    Wdir: float
    Etmp: float

@router.post("/predict/wind")
def predict_wind(data: WindInput):
    model = models.get("wind")
    if not model:
        raise HTTPException(status_code=503, detail="Wind model not available.")

    features = np.array([[data.Wspd, data.Wdir, data.Etmp]])
    prediction = model.predict(features)[0]
    return {"predicted_power_output": prediction}

@router.post("/predict/forecast")
def forecast_energy_output(data: WindInput):
    model = models.get("wind")
    if not model:
        raise HTTPException(status_code=503, detail="Wind model not available.")

    forecast = []
    for i in range(1, 11):
        simulated_wspd = data.Wspd + i * 0.1
        simulated_wdir = data.Wdir 
        simulated_etmp = data.Etmp + i * 0.2

        X = np.array([[simulated_wspd, simulated_wdir, simulated_etmp]])
        prediction = model.predict(X)[0]

        forecast.append({
            "day": f"Day {i * 30}",
            "energyOutput": round(prediction, 2)
        })

    return forecast