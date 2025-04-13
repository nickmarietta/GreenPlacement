import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend,
} from "recharts";
import Loading from "./Loading"; // ✅ import your spinner

const EnergyForecast = ({ coordinates }) => {
  const [showForecast, setShowForecast] = useState(false); // ✅ inside component
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ this too

  useEffect(() => {
    const fetchForecasts = async () => {
      if (!coordinates || coordinates.length !== 2) return;
      const [lng, lat] = coordinates;

      setLoading(true); //Start loading
      try {
        // Step 1: Get wind features
        const weatherRes = await fetch(
          "http://localhost:8000/api/get-weather-features",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          }
        );

        const weatherData = await weatherRes.json();

        // Step 2: Predict wind forecast
        const windForecastRes = await fetch(
          "http://localhost:8000/api/predict/forecast",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Wspd: weatherData.Wspd,
              Wdir: weatherData.Wdir,
              Etmp: weatherData.Etmp,
            }),
          }
        );

        const windData = await windForecastRes.json();

        // Step 3: Get solar forecast prediction
        const solarForecastRes = await fetch(
          "http://localhost:8000/api/predict/solar_forecast",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          }
        );

        const solarData = await solarForecastRes.json();

        // Step 4: Merge wind and solar forecast into unified chart data
        const merged = windData.map((wind, i) => ({
          day: wind.day,
          wind: wind.energyOutput,
          solar: solarData[i]?.energyOutput ?? null,
        }));

        setData(merged);
        console.log("Combined forecast:", merged);
      } catch (error) {
        console.error("Forecast error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showForecast) {
      fetchForecasts();
    }

    if (showForecast) fetchForecasts();
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
                <Label value="Days" position="insideBottom" offset={-15} />
              </XAxis>
              <YAxis>
                <Label
                  value="Energy Output (kW)"
                  angle={-90}
                  position="insideLeft"
                  offset={-20}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="wind"
                stroke="#1f77b4"
                name="Wind Output"
              />
              <Line
                type="monotone"
                dataKey="solar"
                stroke="#ff7f0e"
                name="Solar Output"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default EnergyForecast;
