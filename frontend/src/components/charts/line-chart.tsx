"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const defaultData = [
  { name: "Jan", lunaRay: 120, echowaves: 20, theDrift: 80, ariaMoon: 200 },
  { name: "Feb", lunaRay: 150, echowaves: 35, theDrift: 95, ariaMoon: 220 },
  { name: "Mar", lunaRay: 200, echowaves: 60, theDrift: 110, ariaMoon: 250 },
  { name: "Apr", lunaRay: 280, echowaves: 120, theDrift: 130, ariaMoon: 270 },
  { name: "May", lunaRay: 350, echowaves: 200, theDrift: 150, ariaMoon: 310 },
  { name: "Jun", lunaRay: 420, echowaves: 380, theDrift: 170, ariaMoon: 340 },
];

const defaultLines = [
  { key: "lunaRay", name: "Luna Ray", color: "#7c5cfc" },
  { key: "echowaves", name: "Echo Waves", color: "#06d6a0" },
  { key: "theDrift", name: "The Drift", color: "#ff006e" },
  { key: "ariaMoon", name: "Aria Moon", color: "#ffbe0b" },
];

interface LineChartProps {
  data?: Record<string, unknown>[];
  lines?: { key: string; name: string; color: string }[];
  height?: number;
}

export function LineChartComponent({ data, lines, height = 300 }: LineChartProps) {
  const chartData = data || defaultData;
  const chartLines = lines || defaultLines;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
        <Legend iconSize={10} wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
        {chartLines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
