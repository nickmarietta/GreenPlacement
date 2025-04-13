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

    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([0, 0])
      .addTo(mapRef.current);

    setMarkers((prevMarkers) => [
      ...prevMarkers,
      {
        marker: newMarker,
        lngLat: [0, 0],
      },
    ]);

    const getCoordinates = () => {
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
