import joblib
import os

BASE_DIR = os.path.dirname(__file__)

# File paths
paths = {
    'wind': {
        'model': os.path.join(BASE_DIR, 'wind_turbine_model.pkl'),
        'scaler': os.path.join(BASE_DIR, 'wind_turbine_scaler.pkl'),
    },
    'solar': {
        'model': os.path.join(BASE_DIR, 'solar_panel_model.pkl'),
        'scaler': os.path.join(BASE_DIR, 'solar_panel_scaler.pkl'),
    }
}

# Load models and scalers
models = {}
scalers = {}

for system_type in ['wind', 'solar']:
    try:
        models[system_type] = joblib.load(paths[system_type]['model'])
        scalers[system_type] = joblib.load(paths[system_type]['scaler'])
        print(f"✅ Loaded {system_type} model and scaler.")
    except Exception as e:
        print(f"❌ Failed to load {system_type} model or scaler: {e}")
        models[system_type] = None
        scalers[system_type] = None
