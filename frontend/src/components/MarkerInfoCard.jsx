import React, { useState, useRef, useEffect } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";
import EnergyForecast from "./ShowDetails";

const MarkerInfoCard = ({ id, marker }) => {
  const { markers, setMarkers } = useMapData();
  const markerNameRef = useRef("New Marker");
  const [editting, isEditting] = useState(false);
  const [show, toggleShow] = useState(false);
  console.log("marker = ", marker);
  useEffect(() => {
    if (marker.predictedOutput) {
      toggleShow(true);
    }
  }, [marker]);

  const showMarkerInfo = () => {
    toggleShow(!show);
  };

  const handleDeleteMarker = () => {
    const newMarkers = [...markers];
    newMarkers.splice(id, 1);
    setMarkers(newMarkers);
  };

  const handleEditMarkerName = () => {
    markerNameRef.current;
  };

  const handleDiscardMarkerEdit = () => {
    isEditting(false);
    markerNameRef.current = "Discarded edit";
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="w-full flex gap-1">
          {editting ? (
            <>
              <button
                className="cursor-pointer text-xs"
                onClick={handleEditMarkerName}
              >
                ✅
              </button>
              <input
                ref={markerNameRef}
                className="rounded-lg p-2 bg-blue-200 w-full"
                placeholder={markerNameRef.current}
              />
            </>
          ) : (
            <>
              <button
                className="cursor-pointer text-xs"
                onClick={() => isEditting(true)}
              >
                ✏️
              </button>
              <h2 className="rounded-full p-2 bg-blue-200">
                {markerNameRef.current}
              </h2>
            </>
          )}
          <button
            className="cursor-pointer text-xs"
            onClick={() =>
              editting ? handleDiscardMarkerEdit : handleDeleteMarker
            }
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
              {marker.lngLat &&
                marker.lngLat.map((coord, index) => (
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
            {marker.lngLat &&
              marker.lngLat.map((coord, index) => (
                <p key={`coord-${index}`} className="ml-2">
                  {index == 0
                    ? `Longitude: ${coord.toFixed(2)}°`
                    : `Latitude: ${coord.toFixed(2)}°`}
                </p>
              ))}
          </div>
        </div>
      ) : null}
      {marker && marker.predictedOutput && show && (
        <div className="border-t border-gray-500"></div>
      )}
      {marker && marker.predictedOutput && show && (
        <div className="">
          <div>
            <p className="text-gray-500 text-sm">Results</p>
          </div>
          <div>
            <p>⚡{marker.predictedOutput.toFixed(0)} kW</p>
          </div>
          <EnergyForecast coordinates={coordinates} />
        </>
      )}

      <button
        className="w-full text-center text-gray-500 text-sm cursor-pointer"
        onClick={showMarkerInfo}
      >
        {show ? "^" : marker && marker.predictedOutput ? "v" : null}
      </button>
    </div>
  );
};

export default MarkerInfoCard;
