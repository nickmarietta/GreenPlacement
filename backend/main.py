from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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

# Routes
@app.get("/")
def root():
    return {"message": "Welcome to the Energy Output Predictor API!"}

@app.post("/api/get-features")
async def get_features(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat")
    return {"lng": lng or None, "lat": lat or None}
