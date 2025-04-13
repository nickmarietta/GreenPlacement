import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const EnergyForecast = ({ coordinates }) => {
  const [showForecast, setShowForecast] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      const res = await fetch("http://localhost:8000/api/predict/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lngLat: coordinates }),
      });

      const forecast = await res.json();
      setData(forecast);
    };

    if (showForecast && coordinates.length === 2) {
      fetchForecast();
    }
  }, [showForecast, coordinates]);

  return (
    <>
      <div className="flex justify-center">
        <button
          className="bg-blue-300 p-2 rounded-full cursor-pointer mt-2"
          onClick={() => setShowForecast(true)}
        >
          Show Details
        </button>
      </div>

      {showForecast && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-auto">
          <button
            className="absolute top-4 right-4 text-lg"
            onClick={() => setShowForecast(false)}
          >
            ✖
          </button>
          <h2 className="text-xl mb-4">📈 Energy Output Forecast (300 Days)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="energyOutput" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default EnergyForecast;
