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

  const handleCalculateEnergyOutput = () => {
    setEnergySource("");
  };

  return (
    <div className="w-1/2 bg-gray-300 p-2">
      <div className="flex flex-col gap-2">
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
        <div className="flex justify-center">
          <button
            className=" bg-green-300 p-2 rounded-full cursor-pointer"
            onClick={handleCalculateEnergyOutput}
          >
            Calculate Energy Output
          </button>
        </div>
      </div>
      <div className="w-full">
        {coordinates &&
          coordinates.map((coord, index) => (
            <p key={`coord-${index}`}>
              {index == 0 ? `Latitude: ${coord}` : `Longitude: ${coord}`}
            </p>
          ))}
      </div>
    </div>
  );
};

export default InfoPanel;
