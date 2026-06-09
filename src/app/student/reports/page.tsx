'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Progress } from '@/components/ui/Progress';
import { PerformanceLineChart } from '@/components/charts/PerformanceChart';
import { formatDate, getGradeColor, getPlacementReadinessLabel, getPlacementReadinessColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { QuizAttempt } from '@/types';

export default function StudentReportsPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attempts')
      .then(r => r.json())
      .then(data => { setAttempts(data); setLoading(false); });
  }, []);

  const evaluated = attempts.filter(a => a.status === 'EVALUATED');
  const chartData = evaluated.map((a, i) => ({
    name: `T${i + 1}`,
    percentage: a.percentage ?? 0,
    placementReadiness: (a as any).report?.placementReadiness,
  }));

  const avgScore = evaluated.length
    ? Math.round(evaluated.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / evaluated.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-500 text-sm mt-1">{evaluated.length} completed assessments</p>
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : (
          <>
            {evaluated.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-xs text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{evaluated.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-xs text-gray-400">Average Score</p>
                      <p className="text-2xl font-bold text-primary-600">{avgScore}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Latest Readiness
                      </p>
                      <p className={cn('text-2xl font-bold', getPlacementReadinessColor(
                        (evaluated[0] as any)?.report?.placementReadiness ?? 0
                      ))}>
                        {(evaluated[0] as any)?.report?.placementReadiness ?? 0}%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {chartData.length > 1 && (
                  <Card>
                    <CardHeader><h2 className="font-semibold text-gray-900">Progress Over Time</h2></CardHeader>
                    <CardContent><PerformanceLineChart data={chartData} /></CardContent>
                  </Card>
                )}
              </>
            )}

            <Card>
              <CardHeader><h2 className="font-semibold text-gray-900">All Attempts</h2></CardHeader>
              <CardContent className="space-y-3">
                {attempts.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No attempts yet. Take a quiz to see your report!</p>
                    <Link href="/student/quizzes">
                      <button className="mt-4 text-primary-600 text-sm font-medium hover:underline">Browse Quizzes →</button>
                    </Link>
                  </div>
                )}
                {attempts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{a.quiz?.title}</p>
                        <StatusBadge status={a.quiz?.type} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{formatDate(a.createdAt)}</span>
                        <StatusBadge status={a.status} />
                      </div>
                    </div>

                    {a.status === 'EVALUATED' && (
                      <div className="flex items-center gap-6">
                        <div className="w-28">
                          <Progress value={a.percentage ?? 0} showLabel />
                        </div>
                        {a.report && (
                          <div className="text-center">
                            <p className={cn('text-xl font-bold', getGradeColor(a.report.grade))}>{a.report.grade}</p>
                          </div>
                        )}
                        {a.report && (
                          <div className="text-center w-24">
                            <p className={cn('text-sm font-bold', getPlacementReadinessColor(a.report.placementReadiness))}>
                              {a.report.placementReadiness}%
                            </p>
                            <p className="text-xs text-gray-400">Readiness</p>
                          </div>
                        )}
                        {a.report && (
                          <Link href={`/student/quizzes/${a.id}/report`}>
                            <button className="px-4 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 font-medium">
                              View Report
                            </button>
                          </Link>
                        )}
                      </div>
                    )}

                    {a.status === 'IN_PROGRESS' && (
                      <Link href={`/student/quizzes/${a.quizId}`}>
                        <button className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
                          Resume
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )
      }
    </div>
  );
}
