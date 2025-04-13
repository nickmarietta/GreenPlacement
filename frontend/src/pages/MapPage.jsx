import React, { useState, useContext, createContext } from "react";
// Components
import MapBox from "../components/MapBox";
import InfoPanel from "../components/InfoPanel";

const MapContext = createContext();
export const useMapData = () => {
  return useContext(MapContext);
};

const MapPage = () => {
  const [coordinates, setCoordinates] = useState([0, 0]);

  return (
    <MapContext.Provider value={{ coordinates, setCoordinates }}>
      <div className="flex">
        <InfoPanel />
        <MapBox />
      </div>
    </MapContext.Provider>
  );
};

export default MapPage;
