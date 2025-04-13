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
  BarChart,
  Bar,
} from "recharts";
import Loading from "./Loading";
import homeIcon from "../assets/home.svg?url";

const EnergyForecast = ({
  coordinates,
  predictedSolarOutput,
  predictedWindOutput,
  predictedSolarSustainabilityScore,
  predictedWindSustainabilityScore,
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
        ? { source: "Solar", score: weightedSolar }
        : { source: "Wind", score: weightedWind };
    }
    return null;
  })();

  const costOverTimeData = [
    { year: 2013, Wind: 80, Solar: 150, Nuclear: 100 },
    { year: 2015, Wind: 65, Solar: 120, Nuclear: 95 },
    { year: 2017, Wind: 50, Solar: 80, Nuclear: 90 },
    { year: 2019, Wind: 40, Solar: 50, Nuclear: 90 },
    { year: 2021, Wind: 30, Solar: 40, Nuclear: 88 },
    { year: 2023, Wind: 25, Solar: 35, Nuclear: 85 },
  ];

  const emissionsPerKWhData = [
    { source: "Coal", CO2: 820 },
    { source: "Natural Gas", CO2: 490 },
    { source: "Wind", CO2: 11 },
    { source: "Solar", CO2: 41 },
  ];

  const getHomeIcons = (count) => {
    const maxIcons = 10;
    const iconsToShow = Math.min(Math.floor(count / 10), maxIcons);
    return Array.from({ length: iconsToShow }, (_, idx) => (
      <img key={idx} src={homeIcon} alt="Home" className="w-4 h-4" />
    ));
  };

  const kWhPerHomePerDay = 30;
  const homesPowered = {
    wind: predictedWindOutput
      ? Math.floor(predictedWindOutput / kWhPerHomePerDay)
      : 0,
    solar: predictedSolarOutput
      ? Math.floor(predictedSolarOutput / kWhPerHomePerDay)
      : 0,
  };

  useEffect(() => {
    if (!showForecast) return;
    const fetchForecasts = async () => {
      if (!coordinates || coordinates.length !== 2) return;
      const [lng, lat] = coordinates;

      setLoading(true);
      try {
        const weatherRes = await fetch(
          "http://localhost:8000/api/get-weather-features",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          }
        );

        const weatherData = await weatherRes.json();

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

        const solarForecastRes = await fetch(
          "http://localhost:8000/api/predict/solar_forecast",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          }
        );

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

    if (showForecast) {
      fetchForecasts();
    }

    if (showForecast) fetchForecasts();
  }, [showForecast]);

  const labelMap = {
    emissions: "Emissions",
    landUse: "Land Use",
    waterUse: "Water Use",
    cost: "Cost per kWh",
    scalability: "Scalability",
    scalability: "Scalability",
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
          className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2 rounded-full cursor-pointer mt-2"
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
          <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-t from-gray-800 to-blue-900 z-50 p-4 overflow-y-auto ">
            <button
              className="absolute top-4 right-4 text-lg font-bold cursor-pointer"
              onClick={() => setShowForecast(false)}
              xs
            >
              x
            </button>

            <h2 className="text-xl mb-4 text-center">
              Comparative Visualizations
            </h2>

            {/* Homes Powered Section */}
            <div className="flex justify-center gap-6 mb-4">
              {/* Wind card */}
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow text-center">
                <p className="text-sm font-medium">Wind</p>
                <p className="text-xl font-bold">{homesPowered.wind}</p>
                <p className="text-xs mb-1">homes/day</p>
                <div className="flex flex-wrap justify-center gap-1 text-lg">
                  {getHomeIcons(homesPowered.wind)}
                </div>
              </div>

              {/* Solar card */}
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow text-center">
                <p className="text-sm font-medium">Solar</p>
                <p className="text-xl font-bold">{homesPowered.solar}</p>
                <p className="text-xs mb-1">homes/day</p>
                <div className="flex flex-wrap justify-center gap-1 text-lg">
                  {getHomeIcons(homesPowered.solar)}
                </div>
              </div>
            </div>

            {/* Chart Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[85vh]">
              {/* Forecast Line Chart */}
              <div className="bg-gray-800 p-2 rounded-lg">
                <h3 className="text-lg font-semibold text-center">
                  300-Day Forecast
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="wind"
                      stroke="#1f77b4"
                      name="Wind"
                    />
                    <Line
                      type="monotone"
                      dataKey="solar"
                      stroke="#ff7f0e"
                      name="Solar"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Emissions Chart */}
              <div className="bg-gray-800 p-2 rounded-lg">
                <h3 className="text-lg font-semibold text-center">
                  CO₂ Emissions per kWh
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={emissionsPerKWhData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis
                      label={{
                        value: "gCO₂/kWh",
                        angle: -90,
                        position: "insideLeft",
                        dy: 40,
                      }}
                    />
                    <Tooltip />
                    <Bar dataKey="CO2" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sustainability Comparison */}
              <div className="bg-gray-800 p-2 rounded-lg">
                <h3 className="text-lg font-semibold text-center">
                  Sustainability Comparison
                </h3>
                <ResponsiveContainer width="100%" height="90%">
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
              </div>

              {/* Cost Over Time */}
              <div className="bg-gray-800 p-2 rounded-lg">
                <h3 className="text-lg font-semibold text-center">
                  Cost per MWh Over Time
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={costOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      label={{
                        value: "$/mWh",
                        angle: -90,
                        position: "insideLeft",
                        dy: 40,
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Wind" stroke="#1f77b4" />
                    <Line type="monotone" dataKey="Solar" stroke="#ff7f0e" />
                    <Line type="monotone" dataKey="Nuclear" stroke="#2ca02c" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default EnergyForecast;
