"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Jan", lunaRay: 120, echowaves: 20, theDrift: 80, ariaMoon: 200 },
  { name: "Feb", lunaRay: 150, echowaves: 35, theDrift: 95, ariaMoon: 220 },
  { name: "Mar", lunaRay: 200, echowaves: 60, theDrift: 110, ariaMoon: 250 },
  { name: "Apr", lunaRay: 280, echowaves: 120, theDrift: 130, ariaMoon: 270 },
  { name: "May", lunaRay: 350, echowaves: 200, theDrift: 150, ariaMoon: 310 },
  { name: "Jun", lunaRay: 420, echowaves: 380, theDrift: 170, ariaMoon: 340 },
];

export function LineChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
        <Line type="monotone" dataKey="lunaRay" name="Luna Ray" stroke="#7c5cfc" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="echowaves" name="Echo Waves" stroke="#06d6a0" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="theDrift" name="The Drift" stroke="#ff006e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ariaMoon" name="Aria Moon" stroke="#ffbe0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
