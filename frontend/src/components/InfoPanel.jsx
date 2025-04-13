import React, { useEffect } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";
// Components
import Loading from "./Loading";

const InfoPanel = () => {
  const { coordinates, useCoordinates, energySource, setEnergySource } =
    useMapData();

  const handleAddEnergySource = (source) => {
    if (source == "wind") {
      setEnergySource("wind");
    } else if (source == "solar") {
      setEnergySource("solar");
    }
  };

  const handleCalculateEnergyOutput = () => {
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
      <div className="bg-gray-100 rounded-lg p-2">
        {coordinates &&
          coordinates.map((coord, index) => (
            <p key={`coord-${index}`}>
              {index == 0 ? `Latitude: ${coord}` : `Longitude: ${coord}`}
            </p>
          ))}
      </div>
      <div className="flex justify-center flex-col">
        <button
          className=" bg-green-300 p-2 rounded-full cursor-pointer"
          onClick={handleCalculateEnergyOutput}
        >
          Calculate Energy Output
        </button>
        <Loading />
      </div>
    </div>
  );
};

export default InfoPanel;
