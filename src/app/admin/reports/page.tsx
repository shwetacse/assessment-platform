'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Trophy, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Progress } from '@/components/ui/Progress';
import { PerformanceLineChart } from '@/components/charts/PerformanceChart';
import { formatDateTime, getGradeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AttemptRow {
  id: string;
  score: number | null;
  percentage: number | null;
  status: string;
  createdAt: string;
  student: { name: string; email: string };
  quiz: { title: string; type: string };
  report: { grade: string; placementReadiness: number } | null;
}

export default function ReportsPage() {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attempts')
      .then(r => r.json())
      .then(data => { setAttempts(data); setLoading(false); });
  }, []);

  const evaluated = attempts.filter(a => a.status === 'EVALUATED');
  const avgScore = evaluated.length
    ? Math.round(evaluated.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / evaluated.length)
    : 0;
  const avgReadiness = evaluated.filter(a => a.report).length
    ? Math.round(
        evaluated.filter(a => a.report).reduce((sum, a) => sum + (a.report?.placementReadiness ?? 0), 0) /
        evaluated.filter(a => a.report).length
      )
    : 0;

  const chartData = evaluated.slice(-10).map((a, i) => ({
    name: `A${i + 1}`,
    percentage: a.percentage ?? 0,
    placementReadiness: a.report?.placementReadiness,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Track student performance and placement readiness</p>
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Evaluated"
                value={evaluated.length}
                icon={<Trophy className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="Average Score"
                value={`${avgScore}%`}
                icon={<BarChart3 className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="Avg Placement Readiness"
                value={`${avgReadiness}%`}
                icon={<TrendingUp className="h-5 w-5" />}
                color="purple"
              />
            </div>

            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-gray-900">Recent Performance Trend</h2>
                </CardHeader>
                <CardContent>
                  <PerformanceLineChart data={chartData} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">All Attempts</h2>
              </CardHeader>
              <CardContent>
                {attempts.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No attempts yet</p>
                )}
                <div className="space-y-2">
                  {attempts.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{a.student.name}</p>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="text-xs text-gray-400">{a.quiz.title} · {formatDateTime(a.createdAt)}</p>
                      </div>

                      {a.status === 'EVALUATED' && a.percentage !== null && (
                        <div className="flex items-center gap-6 mr-4">
                          <div className="w-24">
                            <Progress value={a.percentage} showLabel />
                          </div>
                          {a.report && (
                            <div className="text-center">
                              <p className={cn('text-lg font-bold', getGradeColor(a.report.grade))}>
                                {a.report.grade}
                              </p>
                              <p className="text-xs text-gray-400">Grade</p>
                            </div>
                          )}
                          {a.report && (
                            <div className="text-center">
                              <p className="text-sm font-bold text-primary-600">{a.report.placementReadiness}%</p>
                              <p className="text-xs text-gray-400">Readiness</p>
                            </div>
                          )}
                        </div>
                      )}

                      {a.report && (
                        <Link href={`/student/quizzes/${a.id}/report`}>
                          <button className="text-primary-600 hover:text-primary-700">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )
      }
    </div>
  );
}
