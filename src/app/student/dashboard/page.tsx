'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Trophy, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { StatCard, Card, CardHeader, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { PerformanceLineChart } from '@/components/charts/PerformanceChart';
import { formatDate, formatDuration, getGradeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { QuizAttempt, Quiz } from '@/types';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/attempts').then(r => r.json()),
      fetch('/api/quizzes').then(r => r.json()),
    ]).then(([a, q]) => {
      setAttempts(a);
      setQuizzes(q);
      setLoading(false);
    });
  }, []);

  const evaluated = attempts.filter(a => a.status === 'EVALUATED');
  const avgScore = evaluated.length
    ? Math.round(evaluated.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / evaluated.length)
    : 0;
  const latestReadiness = evaluated.find(a => (a as any).report)?.report?.placementReadiness ?? 0;

  const chartData = evaluated.slice(-8).map((a, i) => ({
    name: `T${i + 1}`,
    percentage: a.percentage ?? 0,
    placementReadiness: (a as any).report?.placementReadiness,
  }));

  const upcomingQuizzes = quizzes.filter(q => q.status === 'ACTIVE' || q.status === 'SCHEDULED').slice(0, 3);

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your placement preparation progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Quizzes Completed"
          value={evaluated.length}
          icon={<Trophy className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Placement Readiness"
          value={`${latestReadiness}%`}
          subtitle="Based on latest report"
          icon={<TrendingUp className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Performance Trend</h2>
          </CardHeader>
          <CardContent>
            {chartData.length > 0
              ? <PerformanceLineChart data={chartData} />
              : <p className="text-center text-gray-400 text-sm py-12">Take your first quiz to see trends</p>
            }
          </CardContent>
        </Card>

        {/* Upcoming Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900">Available Quizzes</h2>
            <Link href="/student/quizzes" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingQuizzes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No quizzes available right now</p>
            )}
            {upcomingQuizzes.map(q => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={q.type} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDuration(q.duration)}
                    </span>
                  </div>
                </div>
                <Link href={`/student/quizzes/${q.id}`}>
                  <button className="text-xs text-primary-600 font-medium hover:underline">
                    Take Quiz →
                  </button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Attempts</h2>
            <Link href="/student/reports" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              All Reports <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {attempts.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.quiz?.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-gray-400">{formatDate(a.createdAt)}</span>
                  </div>
                </div>
                {a.status === 'EVALUATED' && (
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Progress value={a.percentage ?? 0} showLabel />
                    </div>
                    {a.report && (
                      <span className={cn('text-base font-bold', getGradeColor(a.report.grade))}>
                        {a.report.grade}
                      </span>
                    )}
                    {a.report && (
                      <Link href={`/student/quizzes/${a.id}/report`}>
                        <button className="text-xs text-primary-600 font-medium hover:underline">Report →</button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
