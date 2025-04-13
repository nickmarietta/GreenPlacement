
import React, { useEffect, useState } from "react";
import { useMapData } from "../pages/MapPage";
import EnergyForecast from "./ShowDetails";
import Loading from "./Loading";
import MarkerInfoCard from "./MarkerInfoCard";

const InfoPanel = () => {
  const {
    coordinates,
    setCoordinates,
    energySource,
    setEnergySource,
    markers,
    setMarkers,
  } = useMapData();
  const [loading, isLoading] = useState(false);

  const handleAddEnergySource = (source) => {
    setEnergySource(source);
  };

  const handleCalculateEnergyOutput = async () => {
    if (markers.length < 1) {
      alert("No marker created. Please place a marker first.");
      return;
    }

    markers.forEach((marker) => {
      const getFeatures = async () => {
        const [lng, lat] = marker.lngLat;
        try {
          isLoading(true);

          // Get wind features
          const weatherRes = await fetch("http://localhost:8000/api/get-weather-features", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          });
          const weatherData = await weatherRes.json();

          // Predict wind energy
          const windRes = await fetch("http://localhost:8000/api/predict/wind", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(weatherData),
          });
          const windOutput = await windRes.json();

          // Get solar features
          const solarRes = await fetch("http://localhost:8000/api/get-solar-features", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lngLat: [lng, lat] }),
          });
          const solarData = await solarRes.json();

          // Predict solar energy
          const solarPredictRes = await fetch("http://localhost:8000/api/predict/solar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(solarData),
          });
          const solarOutput = await solarPredictRes.json();

          const BASE_SCORES = {
            wind: { emissions: 10, landUse: 8, waterUse: 10, cost: 9, scalability: 8 },
            solar: { emissions: 8, landUse: 7, waterUse: 10, cost: 8, scalability: 7 },
          };

          const windScore = { ...BASE_SCORES.wind };
          if (weatherData.Wspd < 3) {
            windScore.scalability -= 2;
            windScore.cost -= 1;
          }

          // Clone and tweak wind score
          const pressurePa = weatherData.pressure_mb * 100;
          const tempK = weatherData.Etmp + 273.15;
          const airDensity = pressurePa / (287.05 * tempK);

          if (airDensity < 1.1) {
            windScore.scalability -= 1;
            windScore.cost -= 0.5;
          }
          if (weatherData.gust_kph > 50) {
            windScore.scalability -= 0.5;
          }
          if (Math.abs(lat) < 5 || Math.abs(lng) < 5) {
            windScore.landUse -= 1;
            windScore.waterUse -= 1;
          }
          Object.keys(windScore).forEach(key => {
            windScore[key] = Math.max(1, Math.min(10, windScore[key]));
          });

          // Clone and tweak solar score
          const solarScore = { ...BASE_SCORES.solar };
          if (solarData.total_cloud_cover_sfc > 70) {
            solarScore.cost -= 1;
            solarScore.scalability -= 1;
          }
          if (solarData.shortwave_radiation_backwards_sfc > 250) {
            solarScore.cost += 1;
          }
          if (solarData.zenith > 80) {
            solarScore.scalability -= 0.5;
            solarScore.cost -= 0.25;
          }
          if (solarData.angle_of_incidence > 85) {
            solarScore.cost -= 1;
            solarScore.waterUse -= 1;
          }
          if (weatherData.cloud > 80) {
            solarScore.scalability -= 0.5;
            solarScore.cost -= 0.25;
          } else if (weatherData.cloud < 15) {
            solarScore.scalability += 0.25;
          }
          if (weatherData.uv > 5) {
            solarScore.cost += 0.25;
            solarScore.scalability += 0.25;
          } else if (weatherData.uv < 1) {
            solarScore.scalability -= 0.25;
          }
          if (Math.abs(lat) < 5 || Math.abs(lng) < 5) {
            solarScore.landUse -= 1;
            solarScore.waterUse -= 1;
          }
          Object.keys(solarScore).forEach(key => {
            solarScore[key] = Math.max(1, Math.min(10, solarScore[key]));
          });

          setMarkers((prev) =>
            prev.map((m) =>
              m === marker
                ? {
                    ...m,
                    predictedOutput: windOutput.predicted_power_output,
                    predictedSolarOutput: solarOutput.predicted_solar_power_kw,
                    predictedWindSustainabilityScore: windScore,
                    predictedSolarSustainabilityScore: solarScore,
                  }
                : m
            )
          );
        } catch (err) {
          console.error("Prediction error:", err);
          alert("Prediction failed. See console for details.");
        } finally {
          isLoading(false);
        }
      };

      getFeatures();
    });
  };

  return (
    <div className="w-1/2 bg-gray-300 p-2 flex flex-col gap-2 overflow-y-auto h-screen">
      <div className="flex flex-col gap-2 bg-gray-100 rounded-lg p-2">
        <p className="text-gray-500 text-sm">Tool box</p>
        <div className="flex justify-center">
          <button
            className="bg-white p-2 rounded-full cursor-pointer"
            onClick={() => handleAddEnergySource("marker")}
          >
            Marker
          </button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-2">
        <p className="text-gray-500 text-sm">Coordinates</p>
        {coordinates?.map((coord, index) => (
          <p key={`coord-${index}`}>
            {index === 0
              ? `Latitude: ${coord.toFixed(2)}°`
              : `Longitude: ${coord.toFixed(2)}°`}
          </p>
        ))}
      </div>
      <div className="flex justify-center flex-col gap-2">
        <button
          className="bg-green-300 p-2 rounded-full cursor-pointer"
          onClick={handleCalculateEnergyOutput}
        >
          Calculate Energy Output
        </button>
        <div className="flex justify-center">{loading && <Loading />}</div>
      </div>
      {markers.map((marker, index) => (
        <MarkerInfoCard key={`marker-${index}`} id={index} marker={marker} />
      ))}
    </div>
  );
};

export default InfoPanel;
