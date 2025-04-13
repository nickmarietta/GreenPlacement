import React, { useEffect } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";

const InfoPanel = () => {
  const { coordinates, useCoordinates, energySource, setEnergySource } =
    useMapData();

  useEffect(() => {
    const getCoordinateFeatures = async (coordinates) => {
      try {
        let res = await fetch("/api/get-features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lngLat: coordinates }),
        });
        // let res = await fetch("/api");
        if (!res.ok) {
          throw new Error("Error fetching");
        }
        res = await res.json();
        console.log(res);
        return res;
      } catch (error) {
        console.error("Failed fetching features:", error);
        throw error;
      }
    };
    getCoordinateFeatures(coordinates);
  }, [coordinates]);

  const handleAddEnergySource = (source) => {
    if (source == "wind") {
      setEnergySource("wind");
    } else if (source == "solar") {
      setEnergySource("solar");
    }
  };

  const handleCalculateEnergyOutput = async () => {
    // ✅ Check if coordinates exist
    if (!coordinates || coordinates.length < 2) {
      alert("Coordinates not selected. Please place a marker on the map.");
      return;
    }
  
    const [lng, lat] = coordinates;
    console.log("📍 Sending coordinates to API:", { lngLat: [lng, lat] });
  
    try {
      // ✅ Step 1: Get weather features from your FastAPI backend
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
  
      // ✅ Step 2: Send features to prediction endpoint
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
        alert(`🔋 Predicted Power Output: ${prediction.predicted_power_output.toFixed(2)} kW`);
      } else {
        alert("Prediction failed.");
      }
    } catch (err) {
      console.error("❌ Error during prediction flow:", err);
      alert("An error occurred. Check the console for details.");
    }
  
    setEnergySource(""); // Optional: reset UI selection
  };

  return (
    <div className="w-1/2 bg-gray-300 p-2 flex flex-col gap-2">
      <div className="flex flex-col gap-2 bg-gray-100 rounded-lg p-2">
        <div>
          <p className="text-gray-500 text-sm">Tool box</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource == "wind"
                ? "outline-2 outline-offset-2 outline-gray-100"
                : ""
            }`}
            onClick={() => handleAddEnergySource("wind")}
          >
            Add wind turbine
          </button>
          <button
            className={`bg-white p-2 rounded-full cursor-pointer ${
              energySource == "solar"
                ? "outline-2 outline-offset-2 outline-gray-100"
                : ""
            }`}
            onClick={() => handleAddEnergySource("solar")}
          >
            Add solar panel
          </button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-2">
        {coordinates &&
          coordinates.map((coord, index) => (
            <p key={`coord-${index}`}>
              {index == 0 ? `Latitude: ${coord}` : `Longitude: ${coord}`}
            </p>
          ))}
      </div>
      <div className="flex justify-center">
        <button
          className=" bg-green-300 p-2 rounded-full cursor-pointer"
          onClick={handleCalculateEnergyOutput}
        >
          Calculate Energy Output
        </button>
      </div>
    </div>
  );
};

export default InfoPanel;
