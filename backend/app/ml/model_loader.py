import joblib
import os
from tensorflow import keras

from tensorflow.keras.models import load_model  

BASE_DIR = os.path.dirname(__file__)

# File paths
paths = {
    'wind': {
        'model': os.path.join(BASE_DIR, 'wind_turbine_model.pkl'),
        'scaler': os.path.join(BASE_DIR, 'wind_turbine_scaler.pkl'),
    },
    'solar': {
        'model': os.path.join(BASE_DIR, 'solarprediction_model.keras'),
        'scaler': os.path.join(BASE_DIR, 'scaler_input.pkl'),
        'scaler_y': os.path.join(BASE_DIR, 'scaler_output.pkl'),
    }
}

# Load models and scalers
models = {}
scalers = {}
try:
    models['wind'] = joblib.load(paths['wind']['model'])
    scalers['wind'] = joblib.load(paths['wind']['scaler']) if os.path.exists(paths['wind']['scaler']) else None
    print("Wind model and scaler loaded.")
except Exception as e:
    print(f"Failed to load wind model or scaler: {e}")
    models['wind'] = None
    scalers['wind'] = None

# Solar Model
try:
    models['solar'] = keras.models.load_model(paths['solar']['model'])
    scalers['solar'] = joblib.load(paths['solar']['scaler'])
    scalers['solar_y'] = joblib.load(paths['solar']['scaler_y'])
    print("Solar model and scalers loaded.")
except Exception as e:
    print(f"Failed to load solar model or scalers: {e}")
    models['solar'] = None
    scalers['solar_input'] = None
    scalers['solar_output'] = None

