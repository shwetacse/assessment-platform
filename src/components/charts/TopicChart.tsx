'use client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { TopicAnalysis } from '@/types';

export function TopicRadarChart({ data }: { data: TopicAnalysis[] }) {
  if (data.length < 3) return <TopicBarChart data={data} />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data.map(d => ({ subject: d.topic, value: d.percentage }))}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
        <Tooltip formatter={(v: number) => [`${v}%`]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function TopicBarChart({ data }: { data: TopicAnalysis[] }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
        <YAxis dataKey="topic" type="category" tick={{ fontSize: 12 }} width={100} />
        <Tooltip formatter={(v: number) => [`${v}%`]} />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
