import React, { useState, useRef, useContext, createContext } from "react";
// Components
import MapBox from "../components/MapBox";
import InfoPanel from "../components/InfoPanel";

const MapContext = createContext();
export const useMapData = () => {
  return useContext(MapContext);
};

const MapPage = () => {
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [energySource, setEnergySource] = useState("");
  const [markers, setMarkers] = useState([]);

  return (
    <MapContext.Provider
      value={{
        coordinates,
        setCoordinates,
        energySource,
        setEnergySource,
        markers,
        setMarkers,
      }}
    >
      <div className="flex">
        <InfoPanel />
        <MapBox />
      </div>
    </MapContext.Provider>
  );
};

export default MapPage;
