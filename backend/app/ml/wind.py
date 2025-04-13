# wind.py (Refactored for training only)
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import os

# Load and preprocess data
df = pd.read_csv('wind_data.csv')
df = df.dropna(subset=['Wspd', 'Wdir', 'Etmp', 'Patv'])

X = df[['Wspd', 'Wdir', 'Etmp']]
y = df['Patv']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("MSE:", mean_squared_error(y_test, y_pred))
print("R²:", r2_score(y_test, y_pred))

# Save model
output_path = os.path.join(os.path.dirname(__file__), 'wind_turbine_model.pkl')
joblib.dump(model, output_path)
print(f"Model saved to {output_path}")
