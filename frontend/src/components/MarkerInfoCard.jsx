import React, { useState, useEffect } from "react";
import { useMapData } from "../pages/MapPage";
import EnergyForecast from "./ShowDetails";

const MarkerInfoCard = ({ id, predictedOutput, coordinates }) => {
  const { markers, setMarkers } = useMapData();
  const [markerName, setMarkerName] = useState();
  const [show, toggleShow] = useState(false);

  useEffect(() => {
    if (predictedOutput) {
      toggleShow(true);
    }
  }, [predictedOutput]);

  const showMarkerInfo = () => {
    toggleShow(!show);
  };

  const handleDeleteMarker = () => {
    const newMarkers = [...markers];
    newMarkers.splice(id, 1);
    setMarkers(newMarkers);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="w-full flex gap-1">
          <h2 className="rounded-full p-2 bg-blue-200">
            {markerName || `Marker ${id}`}
          </h2>
          <button
            className="cursor-pointer text-xs"
            onClick={handleDeleteMarker}
          >
            ❌
          </button>
        </div>
        {!show ? (
          <div className="w-full text-center">
            <div>
              <p className="text-gray-500 text-sm">Coordinates</p>
            </div>
            <div className="flex justify-center gap-1">
              {coordinates &&
                coordinates.map((coord, index) => (
                  <p key={`coord-${index}`} className="text-sm">
                    {index == 0
                      ? `( ${coord.toFixed(2)}°,`
                      : `${coord.toFixed(2)}° )`}
                  </p>
                ))}
            </div>
          </div>
        ) : null}
      </div>

      {show && (
        <>
          <div>
            <p className="text-gray-500 text-sm">Coordinates</p>
          </div>
          <div>
            {coordinates &&
              coordinates.map((coord, index) => (
                <p key={`coord-${index}`} className="ml-2">
                  {index == 0
                    ? `Longitude: ${coord.toFixed(2)}°`
                    : `Latitude: ${coord.toFixed(2)}°`}
                </p>
              ))}
          </div>
        </>
      )}

      {predictedOutput && show && (
        <>
          <div className="border-t border-gray-500"></div>
          <div>
            <p className="text-gray-500 text-sm">Results</p>
            <p>⚡{predictedOutput} kW</p>
          </div>
          <EnergyForecast coordinates={coordinates} />
        </>
      )}

      <button
        className="w-full text-center text-gray-500 text-sm cursor-pointer"
        onClick={showMarkerInfo}
      >
        {show ? "^" : predictedOutput ? "v" : null}
      </button>
    </div>
  );
};

export default MarkerInfoCard;
