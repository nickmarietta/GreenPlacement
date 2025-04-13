# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
import httpx
from app.routers.predictors import router as predictors_router
from app.routers.weather import router as weather_router
from app.routers.solarweather import router as solar_router

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
origins = ["http://localhost:5173", "http://127.0.0.1"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers.weather import router as weather_router
from app.routers.solarweather import router as solar_router

app.include_router(predictors_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(solar_router, prefix="/api")

from app.ml.model_loader import models
import numpy as np


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

