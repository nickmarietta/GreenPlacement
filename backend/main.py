# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from app.ml.predictor import router as wind_predictor_router


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
    lng, lat = data.get("lngLat")
    return {"lng": lng or None, "lat": lat or None}

