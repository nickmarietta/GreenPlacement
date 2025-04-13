import datetime
from fastapi import APIRouter, Request, requests
import httpx
import os
from ..ml.model_loader import models

import numpy as np

router = APIRouter()


@router.post("/get-weather-features")
async def get_weather_features(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat")

    if not (lat and lng):
        return {"error": "Invalid coordinates"}

    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return {"error": "Missing WeatherAPI key. Set WEATHER_API_KEY in .env"}

    url = f"http://api.weatherapi.com/v1/current.json?key={api_key}&q={lat},{lng}&aqi=no"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            weather_data = response.json()

        if "current" not in weather_data:
            return {"error": f"WeatherAPI error: {weather_data.get('error', {}).get('message', 'Unknown error')}"}

        current = weather_data["current"]

        return {
            "Wspd": current.get("wind_kph") / 3.6,   # Wind speed in
            "Wdir": current.get("wind_degree") - 180,
            "Etmp": current.get("temp_c")      # Temperature in Celsius
        }

    except Exception as e:
        return {"error": f"Exception occurred: {str(e)}"}
    
@router.post("/predict/forecast")
async def forecast_energy_output(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat")
    forecast = []
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return {"error": "Missing WeatherAPI key. Set WEATHER_API_KEY in .env"}
    
    for days_ahead in range(30, 301, 30):  # Days 30, 60, ..., 300
        forecast_date = (datetime.utcnow() + datetime.timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        url = f"http://api.weatherapi.com/v1/future.json?key={api_key}&q={lat},{lng}&dt={forecast_date}"

        try:
            res = requests.get(url)
            res.raise_for_status()
            weather = res.json()

            day_data = weather["forecast"]["forecastday"][0]["day"]
            Wspd = day_data["maxwind_kph"] / 3.6
            Wdir = day_data["wind_degree"] - 180
            Etmp = day_data["avgtemp_c"]

            model = models["wind"]
            if model:
                features = np.array([[Wspd, Wdir, Etmp]])
                prediction = model.predict(features)[0]
                forecast.append({
                    "day": f"Day {days_ahead}",
                    "energyOutput": round(prediction, 2)
                })
        except Exception as e:
            forecast.append({
                "day": f"Day {days_ahead}",
                "energyOutput": None,
                "error": str(e)
            })

    return forecast