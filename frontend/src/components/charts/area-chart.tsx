"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const defaultData = [
  { name: "Jan", predictions: 240, accuracy: 85 },
  { name: "Feb", predictions: 310, accuracy: 87 },
  { name: "Mar", predictions: 280, accuracy: 89 },
  { name: "Apr", predictions: 420, accuracy: 91 },
  { name: "May", predictions: 380, accuracy: 90 },
  { name: "Jun", predictions: 510, accuracy: 93 },
  { name: "Jul", predictions: 480, accuracy: 94 },
];

interface AreaChartProps {
  data?: Record<string, unknown>[];
  dataKeys?: { key: string; color: string }[];
  height?: number;
}

const defaultKeys = [
  { key: "predictions", color: "#7c5cfc" },
  { key: "accuracy", color: "#06d6a0" },
];

export function AreaChartComponent({ data, dataKeys, height = 300 }: AreaChartProps) {
  const chartData = data || defaultData;
  const keys = dataKeys || defaultKeys;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k.key} id={`color-${k.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={k.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={k.color} stopOpacity={0} />
            </linearGradient>
          ))}
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
        {keys.map((k) => (
          <Area
            key={k.key}
            type="monotone"
            dataKey={k.key}
            stroke={k.color}
            fillOpacity={1}
            fill={`url(#color-${k.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
