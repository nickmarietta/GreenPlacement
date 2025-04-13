import React from "react";
// Contexts
import { useMapData } from "../pages/MapPage";

const InfoPanel = () => {
  const { coordinates, useCoordinates } = useMapData();
  return (
    <>
      <div className="w-full">
        {coordinates && coordinates.map((coord) => <p>{coord}</p>)}
      </div>
    </>
  );
};

export default InfoPanel;
