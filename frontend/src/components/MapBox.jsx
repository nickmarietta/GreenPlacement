import React, { useEffect, useRef, useState } from "react";
// Mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// Contexts
import { useMapData } from "../pages/MapPage";

const MapBox = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const { coordinates, setCoordinates } = useMapData();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [0, 0],
      zoom: 0,
    });

    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([0, 0])
      .addTo(mapRef.current);

    const getCoordinates = () => {
      const lngLat = marker.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);
    };
    marker.on("dragend", getCoordinates);

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        className="w-full h-screen"
      />
    </>
  );
};

export default MapBox;
