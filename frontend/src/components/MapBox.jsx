import React, { useEffect, useRef, useState } from "react";
// Mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// Contexts
import { useMapData } from "../pages/MapPage";

const MapBox = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const { coordinates, setCoordinates, energySource, markers, setMarkers } =
    useMapData();

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
    // Enforce only one marker (for now)
    // if (markersRef.current) {
    //   markersRef.current = [];
    // }
    const newMarker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat(coordinates)
      .addTo(mapRef.current);
    setMarkers([...markers, newMarker]);
    const getCoordinates = () => {
      const lngLat = newMarker.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);
    };
    newMarker.on("dragend", getCoordinates);
  }, [energySource]);

  useEffect(() => {
    console.log(markers);
  }, [markers]);

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
