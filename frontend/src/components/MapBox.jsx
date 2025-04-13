import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
import RocketMarker from "../components/RocketMarker";
import { useMapData } from "../pages/MapPage";

const MapBox = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const { coordinates, setCoordinates, energySource, markers, setMarkers } = useMapData();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: coordinates,
      zoom: 1,
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create the HTML container for the React rocket marker
    const rocketDiv = document.createElement("div");
    rocketDiv.style.width = "60px";
    rocketDiv.style.height = "90px";
    rocketDiv.style.overflow = "visible";

    // Render the animated rocket component inside the div
    const root = createRoot(rocketDiv);
    root.render(<RocketMarker />);

    // Create and add the mapbox marker with custom HTML
    const placeOn = [coordinates[0] + Math.random() * (0.1 - 0.05) + 0.05, coordinates[1] + Math.random() * (0.1 - 0.05) + 0.05]
    const newMarker = new mapboxgl.Marker({
      element: rocketDiv,
      draggable: true,
    })
      .setLngLat(energySource == 1 ? coordinates : placeOn)
      .addTo(mapRef.current);

    setMarkers((prev) => [
      ...prev,
      {
        marker: newMarker,
        lngLat: energySource == 1 ? coordinates : placeOn,
      },
    ]);

    // Drag handling
    const updateCoordinates = () => {
      const lngLat = newMarker.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);

      setMarkers((prev) =>
        prev.map((m) =>
          m.marker === newMarker
            ? { ...m, lngLat: [lngLat.lng, lngLat.lat] }
            : m
        )
      );
    };

    newMarker.on("dragend", updateCoordinates);
  }, [energySource]);

  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      className="w-full h-screen"
    />
  );
};

export default MapBox;
