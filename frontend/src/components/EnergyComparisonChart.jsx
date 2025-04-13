import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

const EnergyComparisonChart = ({ predictedSolarOutput, predictedWindOutput }) => {
  const data = [
    { name: 'Solar', output: predictedSolarOutput },
    { name: 'Wind', output: predictedWindOutput },
    { name: 'Nuclear', output: 15000000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name">
          <Label value="Energy Source" position="insideBottom" offset={-15} />
        </XAxis>
        <YAxis>
          <Label
            value="Daily Output (kWh)"
            angle={-90}
            position="insideLeft"
            offset={-20}
          />
        </YAxis>
        <Tooltip />
        <Bar dataKey="output" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EnergyComparisonChart;
