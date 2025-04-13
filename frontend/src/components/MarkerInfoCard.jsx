import React, { useState, useRef, useEffect } from "react";
import { useMapData } from "../pages/MapPage";
import EnergyForecast from "./ShowDetails";

const MarkerInfoCard = ({ id, marker }) => {
  const { markers, setMarkers } = useMapData();
  const inputRef = useRef(null);
  const [tempName, setTempName] = useState("New Marker");
  const [editting, isEditting] = useState(false);
  const [show, toggleShow] = useState(false);

  useEffect(() => {
    if (marker.predictedOutput) {
      toggleShow(true);
    }
  }, [marker]);

  const handleToggleShow = () => {
    toggleShow((prev) => !prev);
  };

  const handleDeleteMarker = () => {
    setMarkers(markers.filter((m) => m !== marker));
  };

  const handleEditting = () => {
    setTempName(marker.markerName || "New Marker");
    isEditting(true);
  };

  useEffect(() => {
    if (editting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editting]);

  const handleChangeMarkerName = () => {
    setMarkers(
      markers.map((m) => (m === marker ? { ...m, markerName: tempName } : m))
    );
    isEditting(false);
  };

  const handleDiscardMarkerEdit = () => {
    setTempName(marker.markerName);
    isEditting(false);
  };

  const averageScore = (score) =>
    Object.values(score).reduce((a, b) => a + b, 0) / Object.keys(score).length;

  const bestSource = (() => {
    if (
      marker.predictedSolarSustainabilityScore &&
      marker.predictedWindSustainabilityScore &&
      marker.predictedSolarOutput !== undefined &&
      marker.predictedOutput !== undefined
    ) {
      const averageScore = (score) =>
        Object.values(score).reduce((a, b) => a + b, 0) / Object.keys(score).length;
  
      const solarAvg = averageScore(marker.predictedSolarSustainabilityScore);
      const windAvg = averageScore(marker.predictedWindSustainabilityScore);
  
      let weightedSolar = solarAvg;
      let weightedWind = windAvg;
  
      // Boost for high output
      if (marker.predictedSolarOutput > 10000) weightedSolar += 0.5;
      if (marker.predictedOutput > 10000) weightedWind += 0.5;
  
      // Gradual penalties for being significantly less
      if (marker.predictedSolarOutput < marker.predictedOutput * 0.5) {
        weightedSolar -= 0.5;
      } else if (marker.predictedSolarOutput < marker.predictedOutput) {
        weightedSolar -= 0.25;
      }
  
      if (marker.predictedOutput < marker.predictedSolarOutput * 0.5) {
        weightedWind -= 0.5;
      } else if (marker.predictedOutput < marker.predictedSolarOutput) {
        weightedWind -= 0.25;
      }
  
      return weightedSolar > weightedWind
        ? { source: "Solar ☀️", score: weightedSolar }
        : { source: "Wind 💨", score: weightedWind };
    }
    return null;
  })();
  

  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="w-full flex gap-1 items-center">
          {editting ? (
            <>
              <button className="cursor-pointer text-xs" onClick={handleChangeMarkerName}>
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
              <button className="cursor-pointer text-xs" onClick={handleEditting}>
                ✏️
              </button>
              <h2 className="rounded-full w-full p-2 bg-blue-200">
                {marker.markerName || "New Marker"}
              </h2>
            </>
          )}
          <button
            className="text-xs"
            onClick={() =>
              editting ? handleDiscardMarkerEdit() : handleDeleteMarker()
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
                <p>💨 Wind: {marker.predictedOutput.toFixed(0)} kW</p>
                {marker.predictedSolarOutput !== undefined && (
                  <p>☀️ Solar: {marker.predictedSolarOutput.toFixed(0)} kW</p>
                )}
              </div>

              {bestSource && (
                <>
                  <div className="border-t border-gray-500 mt-2"></div>
                  <p className="text-gray-500 text-sm">🌍 Sustainability Score</p>
                  <p>
                    🏆 Most Sustainable Source: {bestSource.source} (
                    {bestSource.score.toFixed(1)} / 10)
                  </p>
                </>
              )}

              <EnergyForecast
                coordinates={marker.lngLat}
                predictedSolarOutput={marker.predictedSolarOutput}
                predictedWindOutput={marker.predictedOutput}
                predictedSolarSustainabilityScore={marker.predictedSolarSustainabilityScore}
                predictedWindSustainabilityScore={marker.predictedWindSustainabilityScore}
              />
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
