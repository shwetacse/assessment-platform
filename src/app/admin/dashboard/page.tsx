'use client';
import { useEffect, useState } from 'react';
import { Users, ClipboardList, Trophy, TrendingUp } from 'lucide-react';
import { StatCard, Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ScoreBarChart } from '@/components/charts/PerformanceChart';
import { formatDateTime } from '@/lib/utils';
import type { AdminStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="h-8 w-8" />
    </div>
  );

  if (!stats) return null;

  const chartData = Object.entries(stats.quizStatusCounts).map(([k, v]) => ({
    name: k,
    percentage: v,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your assessment platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Quizzes Created"
          value={stats.totalQuizzes}
          icon={<ClipboardList className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts}
          icon={<Trophy className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Avg Score"
          value={`${stats.avgScore}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Quiz Status Distribution</h2>
          </CardHeader>
          <CardContent>
            {chartData.length > 0
              ? <ScoreBarChart data={chartData} />
              : <p className="text-gray-400 text-sm text-center py-8">No quizzes yet</p>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-auto">
            {stats.recentAttempts.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No attempts yet</p>
            )}
            {stats.recentAttempts.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.student?.name}</p>
                  <p className="text-xs text-gray-400">{a.quiz?.title}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={a.status} />
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
