"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", predictions: 240, accuracy: 85 },
  { name: "Feb", predictions: 310, accuracy: 87 },
  { name: "Mar", predictions: 280, accuracy: 89 },
  { name: "Apr", predictions: 420, accuracy: 91 },
  { name: "May", predictions: 380, accuracy: 90 },
  { name: "Jun", predictions: 510, accuracy: 93 },
  { name: "Jul", predictions: 480, accuracy: 94 },
];

export function AreaChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12121a",
            border: "1px solid #2a2a3e",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Area type="monotone" dataKey="predictions" stroke="#7c5cfc" fillOpacity={1} fill="url(#colorPredictions)" strokeWidth={2} />
        <Area type="monotone" dataKey="accuracy" stroke="#06d6a0" fillOpacity={1} fill="url(#colorAccuracy)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
