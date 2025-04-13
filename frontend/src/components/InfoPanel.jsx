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
    setMarkers,
  } = useMapData();
  const [loading, isLoading] = useState(false);

  // Fetch features when coordinates change
  useEffect(() => {
    const getCoordinateFeatures = async (coordinates) => {
      try {
        let res = await fetch("http://localhost:8000/api/get-features", {
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
  
          setMarkers((prev) =>
            prev.map((m) =>
              m === marker
                ? {
                    ...m,
                    predictedOutput: windOutput.predicted_power_output,
                    predictedSolarOutput: solarOutput.predicted_solar_power_kw,
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
            onClick={() => handleAddEnergySource("marker")} // Optional logic if needed
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
