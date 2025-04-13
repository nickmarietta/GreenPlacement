import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from "recharts";

const EnergyForecast = ({ coordinates }) => {
  const [showForecast, setShowForecast] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!coordinates || coordinates.length !== 2) return;

      const [lng, lat] = coordinates;

      try {
        const weatherRes = await fetch("http://localhost:8000/api/get-weather-features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lngLat: [lng, lat] }),
        });

        const weatherData = await weatherRes.json();

        if (!weatherRes.ok || weatherData.error) {
          throw new Error(weatherData.error || "Failed to get weather data.");
        }

        const forecastRes = await fetch("http://localhost:8000/api/predict/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Wspd: weatherData.Wspd,
            Wdir: weatherData.Wdir,
            Etmp: weatherData.Etmp,
          }),
        });

        const forecast = await forecastRes.json();
        setData(forecast);
        console.log("📈 Updated forecast:", forecast);
      } catch (error) {
        console.error("❌ Forecast error:", error);
      }
    };

    if (showForecast) {
      fetchForecast();
    }
  }, [coordinates, showForecast]);

  return (
    <>
      <div className="flex justify-center">
        <button
          className="bg-blue-300 p-2 rounded-full cursor-pointer mt-2"
          onClick={() => setShowForecast(true)}
        >
          Show Details
        </button>
      </div>

      {showForecast && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-auto">
          <button
            className="absolute top-4 right-4 text-lg"
            onClick={() => setShowForecast(false)}
          >
            ✖
          </button>
          <h2 className="text-xl mb-4">📈 Energy Output Forecast (300 Days)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day">
                <Label
                  value="Days"
                  position="insideBottom"
                  offset={-15}  // moves the label down
                />
              </XAxis>
              <YAxis>
                <Label
                  value="Energy Output (kW)"
                  angle={-90}
                  position="insideLeft"
                  offset={-20}  // moves the label left
                  style={{ textAnchor: 'middle' }}
                />
              </YAxis>
              <Tooltip />
              <Line type="monotone" dataKey="energyOutput" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default EnergyForecast;
