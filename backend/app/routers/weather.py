from fastapi import APIRouter, Request
import httpx
import os

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
            "Wspd": current.get("wind_kph") / 3.6,   # Wind speed in kph
            "Wdir": current.get("wind_degree"),
            "Etmp": current.get("temp_c")      # Temperature in Celsius
        }

    except Exception as e:
        return {"error": f"Exception occurred: {str(e)}"}
