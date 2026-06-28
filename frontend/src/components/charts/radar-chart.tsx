"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { subject: "Happiness", value: 72 },
  { subject: "Sadness", value: 45 },
  { subject: "Anger", value: 18 },
  { subject: "Love", value: 88 },
  { subject: "Fear", value: 12 },
  { subject: "Hope", value: 65 },
  { subject: "Nostalgia", value: 58 },
  { subject: "Excitement", value: 79 },
];

export function RadarChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={11} />
        <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" fontSize={10} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#12121a",
            border: "1px solid #2a2a3e",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#7c5cfc"
          fill="#7c5cfc"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
