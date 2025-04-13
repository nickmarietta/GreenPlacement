import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend
} from "recharts";
import Loading from "./Loading"; // ✅ import your spinner

const EnergyForecast = ({ coordinates }) => {
  const [showForecast, setShowForecast] = useState(false); // ✅ inside component
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ this too

  useEffect(() => {
    const fetchForecasts = async () => {
      if (!coordinates || coordinates.length !== 2) return;
      const [lng, lat] = coordinates;

      setLoading(true); // ✅ spinner logic
      try {
        // Fetch wind & solar forecast logic...
      } catch (e) {
        console.error("forecast error", e);
      } finally {
        setLoading(false);
      }
    };

    if (showForecast) fetchForecasts();
  }, [coordinates, showForecast]);

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

      {loading ? (
        <div className="flex justify-center mt-4">
          <Loading width={32} height={32} />
        </div>
      ) : showForecast && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-50 p-4 overflow-auto">
          <button
            className="absolute top-4 right-4 text-lg"
            onClick={() => setShowForecast(false)}
          >
            ✖
          </button>
          <h2 className="text-xl mb-4">📈 Energy Output Forecast (300 Days)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day">
                <Label value="Days" position="insideBottom" offset={-15} />
              </XAxis>
              <YAxis>
                <Label
                  value="Energy Output (kW)"
                  angle={-90}
                  position="insideLeft"
                  offset={-20}
                />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="wind" stroke="#1f77b4" name="Wind Output" />
              <Line type="monotone" dataKey="solar" stroke="#ff7f0e" name="Solar Output" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default EnergyForecast;
