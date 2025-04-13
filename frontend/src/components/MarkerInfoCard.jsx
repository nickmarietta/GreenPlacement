import React, { useState, useRef, useEffect } from "react";
// Contexts
import { useMapData } from "../pages/MapPage";

const MarkerInfoCard = ({ id, marker }) => {
  const { markers, setMarkers } = useMapData();
  const inputRef = useRef(null);
  const [tempName, setTempName] = useState("New Marker");
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

  // Delete entire marker from state array
  const handleDeleteMarker = () => {
    setMarkers(markers.filter((m) => m !== marker));
  };

  // Start editting marker name
  const handleEditting = () => {
    setTempName(marker.markerName || "New Marker");
    isEditting(true);
  };
  useEffect(() => {
    if (editting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editting]);

  // Accept name change
  const handleChangeMarkerName = () => {
    setMarkers(
      markers.map((m) => (m === marker ? { ...m, markerName: tempName } : m))
    );
    isEditting(false);
  };

  // Delete name changes
  const handleDiscardMarkerEdit = () => {
    setTempName(marker.markerName);
    isEditting(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="w-full flex gap-1">
          {editting ? (
            <>
              <button
                className="cursor-pointer text-xs"
                onClick={handleChangeMarkerName}
              >
                ✅
              </button>
              <input
                ref={inputRef}
                className="rounded-lg p-2 bg-blue-200 w-full"
                onChange={(e) => setTempName(e.target.value)}
                value={tempName}
              />
            </>
          ) : (
            <>
              <button
                className="cursor-pointer text-xs"
                onClick={handleEditting}
              >
                ✏️
              </button>
              <h2 className="rounded-full w-full p-2 bg-blue-200">
                {marker.markerName || "New Marker"}
              </h2>
            </>
          )}
          <button
            className="cursor-pointer text-xs"
            onClick={() =>
              editting ? handleDiscardMarkerEdit() : handleDeleteMarker()
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
      {/* Alternative coordinate position and show more details */}
      {show ? (
        <div className="">
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
        </div>
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
