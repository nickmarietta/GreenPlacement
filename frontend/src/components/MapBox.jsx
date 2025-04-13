import React, { useEffect, useRef, useState } from "react";
// Mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// Contexts
import { useMapData } from "../pages/MapPage";

const MapBox = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markerRef = useRef([]);

  const { coordinates, setCoordinates, energySource } = useMapData();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [0, 0],
      zoom: 0,
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([0, 0])
      .addTo(mapRef.current);
    markerRef.current.push(marker);
    // Track the coordinates of the selected marker
    const getCoordinates = () => {
      const lngLat = marker.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);
    };
    marker.on("dragend", getCoordinates);
  }, [energySource]);

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
