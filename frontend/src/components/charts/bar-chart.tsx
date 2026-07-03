"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const defaultData = [
  { name: "Pop", value: 340, fill: "#7c5cfc" },
  { name: "Hip Hop", value: 280, fill: "#06d6a0" },
  { name: "R&B", value: 220, fill: "#ff006e" },
  { name: "Electronic", value: 190, fill: "#ffbe0b" },
  { name: "Latin", value: 170, fill: "#ff6b6b" },
  { name: "Indie", value: 130, fill: "#3a86ff" },
];

interface BarChartProps {
  data?: { name: string; value: number; fill?: string }[];
  color?: string;
  height?: number;
}

export function BarChartComponent({ data, color, height = 300 }: BarChartProps) {
  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
          cursor={{ fill: "rgba(124, 92, 252, 0.05)" }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || color || "#7c5cfc"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
