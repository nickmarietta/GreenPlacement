import React, { useEffect, useState } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";
// Components
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
    if (source == "wind") {
      setEnergySource("wind");
    } else if (source == "solar") {
      setEnergySource("solar");
    }
  };

  const handleCalculateEnergyOutput = async () => {
    // Check if a marker exists
    if (markers.length < 1) {
      alert("❗No marker created. Please select an energy source.");
    }

    markers.forEach((marker) => {
      const getFeatures = async (marker) => {
        try {
          const [lng, lat] = marker.lngLat;
          console.log("📍 Sending coordinates to API:", { lngLat: [lng, lat] });
          isLoading(true);
          // Step 1: Get weather features from your FastAPI backend
          const weatherRes = await fetch(
            "http://localhost:8000/api/get-weather-features",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lngLat: [lng, lat] }),
            }
          );

          const weatherData = await weatherRes.json();
          console.log("🌦 Weather response:", weatherData);

          if (!weatherRes.ok || weatherData.error) {
            throw new Error(weatherData.error || "Failed to get weather data.");
          }

          // Step 2: Send features to prediction endpoint
          const predictionRes = await fetch(
            "http://localhost:8000/api/predict/wind",
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

          const prediction = await predictionRes.json();
          console.log("⚡ Prediction response:", prediction);

          if (prediction.predicted_power_output !== undefined) {
            setMarkers((prev) =>
              prev.map((m) =>
                m === marker
                  ? { ...m, predictedOutput: prediction.predicted_power_output }
                  : m
              )
            );
          } else {
            alert("Prediction failed.");
          }
        } catch (err) {
          console.error("❌ Error during prediction flow:", err);
          alert("An error occurred. Check the console for details.");
        } finally {
          isLoading(false);
        }
      };

      getFeatures(marker);
    });
  };

  return (
    <div className="w-1/2 bg-gray-300 p-2 flex flex-col gap-2 overflow-y-auto h-screen">
      <div className="flex flex-col gap-2 bg-gray-100 rounded-lg p-2">
        <div>
          <p className="text-gray-500 text-sm">Tool box</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource == "wind"
                ? "outline-2 outline-offset-2 outline-gray-200"
                : ""
            }`}
            onClick={() => handleAddEnergySource("wind")}
          >
            Wind turbine
          </button>
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource == "solar"
                ? "outline-2 outline-offset-2 outline-gray-200"
                : ""
            }`}
            onClick={() => handleAddEnergySource("solar")}
          >
            Solar panel
          </button>
        </div>
      </div>

      <div className="flex justify-center flex-col gap-2">
        <button
          className=" bg-green-300 p-2 rounded-full cursor-pointer"
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
