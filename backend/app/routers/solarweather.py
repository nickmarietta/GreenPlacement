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

