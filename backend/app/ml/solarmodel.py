import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
import joblib
import matplotlib.pyplot as plt

df = pd.read_csv(r'C:\GreenPlacement\backend\app\ml\spg.csv')

#Feature Engineering
df['temp_rad'] = df['temperature_2_m_above_gnd'] * df['shortwave_radiation_backwards_sfc']
df['clear_sky_score'] = 100 - df['total_cloud_cover_sfc']

#Select features from the given kaggle
selected_features = [
    'temperature_2_m_above_gnd',
    'relative_humidity_2_m_above_gnd',
    'total_cloud_cover_sfc',
    'shortwave_radiation_backwards_sfc',
    'angle_of_incidence',
    'zenith',
    'azimuth',
    'temp_rad',
    'clear_sky_score'
]

X = df[selected_features].values
y = df['generated_power_kw'].values.reshape(-1, 1)

#Train and test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

#Scale the features using standard scaler
sc_X = StandardScaler()
X_train = sc_X.fit_transform(X_train)
X_test = sc_X.transform(X_test)

sc_y = StandardScaler()
y_train = sc_y.fit_transform(y_train)
y_test = sc_y.transform(y_test)

# Build ANN with dropout and reduced features
def build_model():
    model = Sequential()
    model.add(Dense(128, activation='relu', input_dim=X_train.shape[1]))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Dense(256, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    model.add(Dense(128, activation='relu'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse', metrics=[tf.keras.metrics.RootMeanSquaredError()])
    return model

model = build_model()

#Train the model
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=100,
    batch_size=32,
    verbose=2
)

#Evaluate the model for testing
y_pred = model.predict(X_test)
y_pred_orig = sc_y.inverse_transform(y_pred)
y_test_orig = sc_y.inverse_transform(y_test)

mse = mean_squared_error(y_test_orig, y_pred_orig)
rmse = np.sqrt(mse)
r2 = r2_score(y_test_orig, y_pred_orig)

'''
print(f"RMSE: {rmse:.4f}")
print(f"MSE: {mse:.4f}")
print(f"R² Score: {r2:.4f}")'''


#Save Model and scalers
model.save("solarprediction_model.keras")
joblib.dump(sc_X, "scaler_input.pkl")
joblib.dump(sc_y, "scaler_output.pkl")
