"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Pop", value: 35, color: "#7c5cfc" },
  { name: "Hip Hop", value: 25, color: "#06d6a0" },
  { name: "R&B", value: 15, color: "#ff006e" },
  { name: "Electronic", value: 12, color: "#ffbe0b" },
  { name: "Latin", value: 8, color: "#ff6b6b" },
  { name: "Other", value: 5, color: "#3a86ff" },
];

export function PieChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#12121a",
            border: "1px solid #2a2a3e",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Legend
          iconSize={10}
          wrapperStyle={{ fontSize: "12px", color: "#6b7280" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
