import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, Legend, BarChart, Bar
} from "recharts";
import Loading from "./Loading";

const EnergyForecast = ({
  coordinates,
  predictedSolarOutput,
  predictedWindOutput,
  predictedSolarSustainabilityScore,
  predictedWindSustainabilityScore
}) => {
  const [showForecast, setShowForecast] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const averageScore = (score) =>
    Object.values(score).reduce((a, b) => a + b, 0) / Object.keys(score).length;

  const bestSource = (() => {
    if (
      predictedSolarSustainabilityScore &&
      predictedWindSustainabilityScore &&
      predictedSolarOutput !== undefined &&
      predictedWindOutput !== undefined
    ) {
      const solarAvg = averageScore(predictedSolarSustainabilityScore);
      const windAvg = averageScore(predictedWindSustainabilityScore);

      let weightedSolar = solarAvg;
      let weightedWind = windAvg;

      if (predictedSolarOutput > 10000) weightedSolar += 0.5;
      if (predictedWindOutput > 10000) weightedWind += 0.5;

      if (predictedSolarOutput < predictedWindOutput * 0.5) {
        weightedSolar -= 0.5;
      } else if (predictedSolarOutput < predictedWindOutput) {
        weightedSolar -= 0.25;
      }

      if (predictedWindOutput < predictedSolarOutput * 0.5) {
        weightedWind -= 0.5;
      } else if (predictedWindOutput < predictedSolarOutput) {
        weightedWind -= 0.25;
      }

      return weightedSolar > weightedWind
        ? { source: "Solar ☀️", score: weightedSolar }
        : { source: "Wind 💨", score: weightedWind };
    }
    return null;
  })();

  useEffect(() => {
    const fetchForecasts = async () => {
      if (!coordinates || coordinates.length !== 2) return;
      const [lng, lat] = coordinates;

      setLoading(true);
      try {
        const weatherRes = await fetch("http://localhost:8000/api/get-weather-features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lngLat: [lng, lat] }),
        });

        const weatherData = await weatherRes.json();

        const windForecastRes = await fetch("http://localhost:8000/api/predict/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Wspd: weatherData.Wspd,
            Wdir: weatherData.Wdir,
            Etmp: weatherData.Etmp,
          }),
        });

        const windData = await windForecastRes.json();

        const solarForecastRes = await fetch("http://localhost:8000/api/predict/solar_forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lngLat: [lng, lat] }),
        });

        const solarData = await solarForecastRes.json();

        const merged = windData.map((wind, i) => ({
          day: wind.day,
          wind: wind.energyOutput,
          solar: solarData[i]?.energyOutput ?? null,
        }));

        setData(merged);
      } catch (error) {
        console.error("Forecast error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showForecast) fetchForecasts();
  }, [coordinates, showForecast]);

  const labelMap = {
    emissions: "Emissions",
    landUse: "Land Use",
    waterUse: "Water Use",
    cost: "Cost per kWh",
    scalability: "Scalability"
  };

  const sustainabilityBarData =
    predictedWindSustainabilityScore && predictedSolarSustainabilityScore
      ? Object.keys(predictedSolarSustainabilityScore).map((key) => ({
          metric: labelMap[key] || key,
          Wind: parseFloat(predictedWindSustainabilityScore[key].toFixed(1)),
          Solar: parseFloat(predictedSolarSustainabilityScore[key].toFixed(1)),
        }))
      : [];

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

      {loading ? (
        <div className="flex justify-center mt-4">
          <Loading width={32} height={32} />
        </div>
      ) : (
        showForecast && (
          <div className="fixed top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-auto">
            <button
              className="absolute top-4 right-4 text-lg"
              onClick={() => setShowForecast(false)}
            >
              ✖
            </button>

            <h2 className="text-xl mb-4">📈 Energy Output Forecast (300 Days)</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 40 }}>
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
                  />
                </YAxis>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20 }}
                />
                <Line type="monotone" dataKey="wind" stroke="#1f77b4" name="Wind Output" />
                <Line type="monotone" dataKey="solar" stroke="#ff7f0e" name="Solar Output" />
              </LineChart>
            </ResponsiveContainer>

            {sustainabilityBarData.length > 0 && (
              <>
                <h2 className="text-xl mt-8 mb-4">🌿 Sustainability Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sustainabilityBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Wind" fill="#1f77b4" />
                    <Bar dataKey="Solar" fill="#ff7f0e" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )
      )}
    </>
  );
};

export default EnergyForecast;
