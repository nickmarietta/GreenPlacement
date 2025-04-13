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
