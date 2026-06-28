// ===== Chart Data Types =====

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}
