import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const MapBox = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [coordinates, setCoordinates] = useState();

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9obnZvIiwiYSI6ImNtOWV1eXhxaDE4OGYycnEwYnExMDVqamoifQ.Z47vTvOeYLmxkaz1PrlYGw";
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      zoom: 5,
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
        className="w-screen h-screen"
      />
      <div className="w-full">
        {coordinates && coordinates.map((coord) => <p>{coord}</p>)}
      </div>
    </>
  );
};

export default MapBox;
