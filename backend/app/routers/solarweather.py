from fastapi import APIRouter, Request
import httpx
import os

router = APIRouter()


@router.post("/get-solar-features")
async def get_solar_features(request: Request):
    from retry_requests import retry
    import openmeteo_requests
    import requests_cache
    import pandas as pd
    import pvlib
    from datetime import datetime

    data = await request.json()
    lng, lat = data.get("lngLat")

    # Setup Open-Meteo
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    # Request current hourly data
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "hourly": "temperature_2m,relative_humidity_2m,cloudcover,shortwave_radiation",
        "current_weather": True,
        "timezone": "UTC"
    }
    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]
    hourly = response.Hourly()

    # Get latest hourly values
    idx = -1  # last hour
    temperature = hourly.Variables(0).ValuesAsNumpy()[idx]
    humidity = hourly.Variables(1).ValuesAsNumpy()[idx]
    cloudcover = hourly.Variables(2).ValuesAsNumpy()[idx]
    radiation = hourly.Variables(3).ValuesAsNumpy()[idx]

    # Compute solar geometry
    now = datetime.utcnow()
    solpos = pvlib.solarposition.get_solarposition(now, lat, lng)
    zenith = solpos['zenith'].values[0]
    azimuth = solpos['azimuth'].values[0]

    # Assume surface is flat and facing south (tilt=30°, azimuth=180°)
    angle_of_incidence = pvlib.irradiance.aoi(30, 180, zenith, azimuth)

    return {
    "temperature_2_m_above_gnd": float(temperature),
    "relative_humidity_2_m_above_gnd": float(humidity),
    "total_cloud_cover_sfc": float(cloudcover),
    "shortwave_radiation_backwards_sfc": float(radiation),
    "zenith": float(zenith),
    "azimuth": float(azimuth),
    "angle_of_incidence": float(angle_of_incidence)
}

@router.post("/predict/solar_forecast")
async def predict_solar_forecast(request: Request):
    import os
    from fastapi import Request
    import httpx
    import numpy as np
    import pandas as pd
    import pvlib
    from datetime import datetime, timedelta
    from ..ml.model_loader import models, scalers

    data = await request.json()
    lng, lat = data.get("lngLat")

    model = models.get("solar")
    scaler_X = scalers.get("solar")
    scaler_y = scalers.get("solar_y")

    if not model or not scaler_X or not scaler_y:
        return {"error": "Solar model or scaler not available."}

    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return {"error": "Missing WeatherAPI key. Set WEATHER_API_KEY in .env"}

    forecast = []

    for days_ahead in range(30, 301, 30):
        target_date = (datetime.utcnow() + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        url = f"http://api.weatherapi.com/v1/future.json?key={api_key}&q={lat},{lng}&dt={target_date}"

        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(url)
                res.raise_for_status()
                data = res.json()

            day = data["forecast"]["forecastday"][0]["day"]
            hours = data["forecast"]["forecastday"][0]["hour"]

            temperature = day["avgtemp_c"]
            humidity = day["avghumidity"]
            uv_index = day.get("uv", 5.0)  # fallback to 5.0 if missing

            # Estimate solar radiation (W/m²) from UV index (very rough)
            radiation = uv_index * 25

            # Estimate cloud cover as average from 3-hourly intervals
            cloud_values = [h["cloud"] for h in hours if "cloud" in h]
            cloudcover = sum(cloud_values) / len(cloud_values) if cloud_values else 50.0

            # Compute solar geometry
            target_datetime = datetime.utcnow() + timedelta(days=days_ahead)
            solpos = pvlib.solarposition.get_solarposition(target_datetime, lat, lng)
            zenith = solpos['zenith'].values[0]
            azimuth = solpos['azimuth'].values[0]
            angle_of_incidence = pvlib.irradiance.aoi(30, 180, zenith, azimuth)

            # Derived features
            temp_rad = temperature * radiation
            clear_sky_score = 100 - cloudcover

            features = np.array([[  
                temperature,
                humidity,
                cloudcover,
                radiation,
                angle_of_incidence,
                zenith,
                azimuth,
                temp_rad,
                clear_sky_score
            ]])

            if zenith > 90:
                predicted = 0.0
            else:
                scaled = scaler_X.transform(features)
                prediction_scaled = model.predict(scaled)
                prediction = scaler_y.inverse_transform(prediction_scaled)[0][0]
                predicted = float(max(0.0, round(prediction, 2) * 8))

            forecast.append({
                "day": f"Day {days_ahead}",
                "energyOutput": float(predicted)
            })

        except Exception as e:
            forecast.append({
                "day": f"Day {days_ahead}",
                "energyOutput": None,
                "error": str(e)
            })

    return forecast


