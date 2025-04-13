import React, { useEffect, useState } from "react";
// Contexts
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
  } = useMapData();
  const [predictedOutput, setPredictedOutput] = useState(null);
  const [loading, isLoading] = useState(false);

  // Fetch features when coordinates change
  useEffect(() => {
    const getCoordinateFeatures = async (coordinates) => {
      try {
        let res = await fetch("/api/get-features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lngLat: coordinates }),
        });
        if (!res.ok) {
          throw new Error("Error fetching");
        }
        const data = await res.json();
        console.log("📍 Coordinate features:", data);
      } catch (error) {
        console.error("Failed fetching features:", error);
      }
    };
    getCoordinateFeatures(coordinates);
  }, [coordinates]);

  const handleAddEnergySource = (source) => {
    setEnergySource(source);
  };

  const handleCalculateEnergyOutput = async () => {
    if (!coordinates || coordinates.length < 2) {
      alert("Coordinates not selected. Please place a marker on the map.");
      return;
    }
    if (markers.length < 1) {
      alert("No marker created. Please select an energy source.");
    }

    const [lng, lat] = coordinates;
    console.log("📤 Sending coordinates to API:", { lngLat: [lng, lat] });

    try {
      isLoading(true);
      // Step 1: Get weather features from your FastAPI backend
      const weatherRes = await fetch("http://localhost:8000/api/get-weather-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lngLat: [lng, lat] }),
      });


      const weatherData = await weatherRes.json();
      console.log("🌦 Weather response:", weatherData);

      if (!weatherRes.ok || weatherData.error) {
        throw new Error(weatherData.error || "Failed to get weather data.");
      }

      // Step 2: Send features to prediction endpoint
      const predictionRes = await fetch("http://localhost:8000/api/predict/wind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Wspd: weatherData.Wspd,
          Wdir: weatherData.Wdir,
          Etmp: weatherData.Etmp,
        }),
      });

      const prediction = await predictionRes.json();
      console.log("⚡ Prediction response:", prediction);

      if (prediction.predicted_power_output !== undefined) {
        setPredictedOutput(prediction.predicted_power_output.toFixed(0));
      } else {
        alert("Prediction failed.");
      }
    } catch (err) {
      console.error("Error during prediction flow:", err);
      alert("An error occurred. Check the console for details.");
    } finally {
      isLoading(false);
      setEnergySource("");
    }
  };

  return (
    <div className="w-1/2 bg-gray-300 p-2 flex flex-col gap-2 overflow-y-auto h-screen">
      <div className="flex flex-col gap-2 bg-gray-100 rounded-lg p-2">
        <p className="text-gray-500 text-sm">Tool box</p>
        <div className="flex gap-2 justify-center">
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource === "wind"
                ? "outline-2 outline-offset-2 outline-gray-200"
                : ""
            }`}
            onClick={() => handleAddEnergySource("wind")}
          >
            Wind turbine
          </button>
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource === "solar"
                ? "outline-2 outline-offset-2 outline-gray-200"
                : ""
            }`}
            onClick={() => handleAddEnergySource("solar")}
          >
            Solar panel
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
        {markers.map((_, index) => (
          <MarkerInfoCard
            key={`marker-${index}`}
            predictedOutput={predictedOutput}
            id={index}
            coordinates={coordinates}
          />
        ))}
    </div>
  );
};

export default InfoPanel;
