import React, { useState, useEffect } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";
import EnergyForecast from "./ShowDetails";

const MarkerInfoCard = ({ id, marker }) => {
  const { markers, setMarkers } = useMapData();
  const [editing, setEditing] = useState(false);
  const [markerName, setMarkerName] = useState("New Marker");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (marker.predictedOutput) {
      setShow(true);
    }
  }, [marker]);

  const handleToggleShow = () => {
    setShow((prev) => !prev);
  };

  const handleDeleteMarker = () => {
    const newMarkers = [...markers];
    newMarkers.splice(id, 1);
    setMarkers(newMarkers);
  };

  const handleSaveMarkerName = () => {
    setEditing(false);
  };

  const handleDiscardMarkerEdit = () => {
    setEditing(false);
    setMarkerName("Discarded edit");
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="w-full flex gap-1 items-center">
          {editing ? (
            <>
              <button className="text-xs" onClick={handleSaveMarkerName}>
                ✅
              </button>
              <input
                className="rounded-lg p-2 bg-blue-200 w-full"
                value={markerName}
                onChange={(e) => setMarkerName(e.target.value)}
              />
            </>
          ) : (
            <>
              <button
                className="text-xs"
                onClick={() => setEditing(true)}
              >
                ✏️
              </button>
              <h2 className="rounded-full p-2 bg-blue-200">{markerName}</h2>
            </>
          )}
          <button
            className="text-xs"
            onClick={() =>
              editing ? handleDiscardMarkerEdit : handleDeleteMarker()
            }
          >
            ❌
          </button>
        </div>

        {!show && (
          <div className="w-full text-center">
            <p className="text-gray-500 text-sm">Coordinates</p>
            <div className="flex justify-center gap-1">
              {marker.lngLat &&
                marker.lngLat.map((coord, index) => (
                  <p key={`coord-${index}`} className="text-sm">
                    {index === 0
                      ? `( ${coord.toFixed(2)}°,`
                      : `${coord.toFixed(2)}° )`}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>

      {show && (
        <>
          <div>
            <p className="text-gray-500 text-sm">Coordinates</p>
            {marker.lngLat &&
              marker.lngLat.map((coord, index) => (
                <p key={`coord-${index}`} className="ml-2">
                  {index === 0
                    ? `Longitude: ${coord.toFixed(2)}°`
                    : `Latitude: ${coord.toFixed(2)}°`}
                </p>
              ))}
          </div>

          {marker.predictedOutput && (
            <>
              <div className="border-t border-gray-500 mt-2"></div>
              <div>
                <p className="text-gray-500 text-sm">Results</p>
                <p>⚡ {marker.predictedOutput.toFixed(0)} kW</p>
              </div>
              <EnergyForecast coordinates={marker.lngLat} />
            </>
          )}
        </>
      )}

      {marker && (
        <button
          className="w-full text-center text-gray-500 text-sm cursor-pointer"
          onClick={handleToggleShow}
        >
          {show ? "^" : marker.predictedOutput ? "v" : null}
        </button>
      )}
    </div>
  );
};

export default MarkerInfoCard;
