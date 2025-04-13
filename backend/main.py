# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
import httpx
from app.routers.predictors import router as wind_predictor_router
from app.routers.weather import router as weather_router

from dotenv import load_dotenv

# Load env vars first
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Energy Output Predictor API",
    description="Predicts wind and solar energy output based on environmental features.",
    version="1.0.0"
)

# CORS setup
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.ml.predictor import router as predictor_router
from app.routers.weather import router as weather_router
from app.routers.solarweather import router as solar_router

app.include_router(predictor_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(solar_router, prefix="/api")

from app.ml.model_loader import models
import numpy as np

@app.post("/api/predict/forecast")
def forecast_energy_output(features: dict):
    model = models["wind"]
    forecast = []

    for i in range(1, 11):
        # Simulate changing weather features over time
        # In a real case, you'd pull weather API data here
        simulated_wspd = features.get("Wspd", 8) + i * 0.1
        simulated_wdir = features.get("Wdir", 180)
        simulated_etmp = features.get("Etmp", 15) + i * 0.2

        X = np.array([[simulated_wspd, simulated_wdir, simulated_etmp]])

        prediction = model.predict(X)[0] if model else None

        forecast.append({
            "day": f"Day {i * 30}",
            "energyOutput": round(prediction, 2) if prediction else None
        })

    return forecast


# Routes
@app.get("/")
def root():
    return {"message": "Welcome to the Energy Output Predictor API!"}

@app.post("/api/get-features")
async def get_features(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat") # Get coordinates from request body
    # Call external API to get features
    async with httpx.AsyncClient() as client:
        res = await client.get(f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lng}&exclude=minutely,hourly,daily,alerts&appid={os.getenv("WEATHER_API")}')

        weather_data = res.json()
    
    # Select features to return
    
    return {"weater_data": weather_data}

