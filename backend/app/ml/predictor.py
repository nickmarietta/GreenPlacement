import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Load the dataset
df = pd.read_csv('wind_data.csv')  # Replace with your actual filename

# Drop rows with missing values in required columns
df = df.dropna(subset=['Wspd', 'Wdir', 'Etmp', 'Patv'])

# Define features and target
X = df[['Wspd', 'Wdir', 'Etmp']]
y = df['Patv']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize and train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.2f}")
print(f"R^2 Score: {r2:.4f}")

# Optional: Save the trained model to a file
import joblib
joblib.dump(model, 'wind_power_predictor.pkl')
print("Model saved to 'wind_power_predictor.pkl'")
