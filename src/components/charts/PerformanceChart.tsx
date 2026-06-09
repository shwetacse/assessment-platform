'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';

interface PerformancePoint {
  name: string;
  percentage: number;
  placementReadiness?: number;
}

export function PerformanceLineChart({ data }: { data: PerformancePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === 'percentage' ? 'Score' : 'Placement Readiness',
          ]}
        />
        <Legend />
        <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Score %" />
        {data.some(d => d.placementReadiness !== undefined) && (
          <Line type="monotone" dataKey="placementReadiness" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Placement Readiness" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScoreBarChart({ data }: { data: PerformancePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => [`${v}%`]} />
        <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Score %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
