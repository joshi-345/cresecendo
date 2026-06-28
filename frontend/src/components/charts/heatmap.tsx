"use client";

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

const genres = ["Pop", "Hip Hop", "R&B", "Electronic", "Latin", "Indie"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// Generate sample heatmap data
const data: HeatmapCell[] = genres.flatMap((genre) =>
  months.map((month) => ({
    x: month,
    y: genre,
    value: Math.floor(Math.random() * 100),
  }))
);

function getColor(value: number): string {
  if (value >= 80) return "rgba(124, 92, 252, 0.8)";
  if (value >= 60) return "rgba(124, 92, 252, 0.5)";
  if (value >= 40) return "rgba(124, 92, 252, 0.3)";
  if (value >= 20) return "rgba(124, 92, 252, 0.15)";
  return "rgba(124, 92, 252, 0.05)";
}

export function HeatmapChart() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* X-axis labels */}
        <div className="mb-2 flex pl-24">
          {months.map((month) => (
            <div key={month} className="flex-1 text-center text-xs text-gray-500">
              {month}
            </div>
          ))}
        </div>

        {/* Grid */}
        {genres.map((genre) => (
          <div key={genre} className="flex items-center gap-2">
            <div className="w-20 text-right text-xs text-gray-400">{genre}</div>
            <div className="flex flex-1 gap-1">
              {months.map((month) => {
                const cell = data.find((d) => d.x === month && d.y === genre);
                return (
                  <div
                    key={`${genre}-${month}`}
                    className="group relative flex-1"
                    title={`${genre} - ${month}: ${cell?.value ?? 0}`}
                  >
                    <div
                      className="aspect-square rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-glow"
                      style={{ backgroundColor: getColor(cell?.value ?? 0) }}
                    />
                    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-surface-card px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {cell?.value ?? 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500">Less</span>
          {[0.05, 0.15, 0.3, 0.5, 0.8].map((opacity) => (
            <div
              key={opacity}
              className="h-3 w-3 rounded"
              style={{ backgroundColor: `rgba(124, 92, 252, ${opacity})` }}
            />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}
