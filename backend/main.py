# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.ml.predictor import router as wind_predictor_router
import httpx
import os

app = FastAPI(
    title="Energy Output Predictor API",
    description="Predicts wind turbine energy output based on environmental features.",
    version="1.0.0"
)

# Allow CORS for your frontend
origins = [
    "http://localhost:5173",  # Vite default dev server
    # Add your production domain here when deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your prediction endpoint(s)
app.include_router(wind_predictor_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the Energy Output Predictor API!"}
  
@app.post("/get-features")
async def get_features(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat") # Get coordinates from request body
    # Call external API to get features
    async with httpx.AsyncClient() as client:
        res = await client.get(f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lng}&exclude=minutely,hourly,daily,alerts&appid={os.getenv("WEATHER_API")}")
        weather_data = res.json()
    
    # Select features to return
    
    return {"weater_data": weather_data}

