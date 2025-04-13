# predictor.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from .model_loader import models, scalers

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

#Solar Model
class SolarInput(BaseModel):
    temperature_2_m_above_gnd: float
    relative_humidity_2_m_above_gnd: float
    total_cloud_cover_sfc: float
    shortwave_radiation_backwards_sfc: float
    angle_of_incidence: float
    zenith: float
    azimuth: float


@router.post("/predict/solar")
def predict_solar(data: SolarInput):
    model = models.get("solar")
    scaler_X = scalers.get("solar")
    scaler_y = scalers.get("solar_y")

    if not model or not scaler_X or not scaler_y:
        raise HTTPException(status_code=503, detail="Solar model or scaler not available.")

    # Engineer features
    temp_rad = data.temperature_2_m_above_gnd * data.shortwave_radiation_backwards_sfc
    clear_sky_score = 100 - data.total_cloud_cover_sfc

    features = np.array([[  
        data.temperature_2_m_above_gnd,
        data.relative_humidity_2_m_above_gnd,
        data.total_cloud_cover_sfc,
        data.shortwave_radiation_backwards_sfc,
        data.angle_of_incidence,
        data.zenith,
        data.azimuth,
        temp_rad,
        clear_sky_score
    ]])

    # Prevent prediction if sun is below the horizon
    if data.zenith > 90:
        return {"predicted_solar_power_kw": 0.0}

    scaled = scaler_X.transform(features)
    prediction_scaled = model.predict(scaled)
    prediction = scaler_y.inverse_transform(prediction_scaled)[0][0]

    # Clip to non-negative
    prediction = max(0.0, prediction)

    #Multiply by 8 for the 24 hours of the day
    return {"predicted_solar_power_kw": float(round(prediction, 2) * 8)}
