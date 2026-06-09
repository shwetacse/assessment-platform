'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, XCircle, AlertCircle, TrendingUp, Star, ArrowLeft, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { TopicRadarChart } from '@/components/charts/TopicChart';
import {
  formatTimeTaken, getGradeColor, getPlacementReadinessColor, getPlacementReadinessLabel,
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AssessmentReport } from '@/types';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    async function fetchReport() {
      // First get the attempt to find the report
      const attemptRes = await fetch(`/api/attempts/${id}`);
      const attempt = await attemptRes.json();

      if (attempt?.report?.id) {
        const reportRes = await fetch(`/api/reports/${attempt.report.id}`);
        const data = await reportRes.json();
        if (reportRes.ok) {
          setReport(data);
          setLoading(false);
          setPolling(false);
          return true;
        }
      } else if (attempt?.status === 'EVALUATED') {
        setError('Report generation in progress...');
      }
      return false;
    }

    async function poll() {
      const found = await fetchReport();
      if (!found && attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 2000);
      } else if (attempts >= maxAttempts) {
        setError('Report not available. Please try again later.');
        setLoading(false);
        setPolling(false);
      }
    }

    poll();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <Spinner className="h-10 w-10" />
      <p className="text-gray-600">Generating your assessment report...</p>
      <p className="text-gray-400 text-sm">Claude AI is analyzing your performance</p>
    </div>
  );

  if (error && !report) return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
      <p className="text-gray-600">{error}</p>
    </div>
  );

  if (!report) return null;

  const attempt = report.attempt!;
  const topicAnalysis = Array.isArray(report.topicAnalysis)
    ? report.topicAnalysis
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/student/quizzes">
          <button className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Report</h1>
          <p className="text-gray-500 text-sm">{attempt.quiz?.title}</p>
        </div>
      </div>

      {/* Score Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm mb-1">Your Score</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold">{report.percentage}%</span>
              <span className={cn('text-4xl font-bold', getGradeColor(report.grade))}>{report.grade}</span>
            </div>
            <p className="text-primary-200 text-sm mt-1">
              {report.overallScore} / {attempt.totalMarks} marks
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-primary-200 text-xs mb-1 flex items-center gap-1 justify-end">
                <TrendingUp className="h-3 w-3" /> Placement Readiness
              </p>
              <p className="text-4xl font-bold">{report.placementReadiness}%</p>
              <p className="text-primary-200 text-sm">{getPlacementReadinessLabel(report.placementReadiness)}</p>
            </div>
          </div>
        </div>
        <Progress value={report.percentage} barClassName="bg-white" className="mt-4" />
      </div>

      {/* Quiz Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quiz Type', value: <StatusBadge status={attempt.quiz?.type ?? ''} /> },
          { label: 'Time Taken', value: attempt.timeTaken ? formatTimeTaken(attempt.timeTaken) : 'N/A' },
          { label: 'Questions', value: attempt.answers?.length ?? 0 },
          { label: 'Submitted', value: attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('en-IN') : 'N/A' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <div className="font-bold text-gray-900">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Performance Summary</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Strengths</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Areas for Improvement</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{w}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Topic Analysis */}
      {topicAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Topic-wise Performance</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopicRadarChart data={topicAnalysis} />
              <div className="space-y-3">
                {topicAnalysis.map(t => (
                  <div key={t.topic}>
                    <Progress
                      value={t.percentage}
                      showLabel
                      label={`${t.topic} (${t.score}/${t.total})`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Placement Preparation Recommendations</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-primary-600 font-bold text-sm shrink-0">{i + 1}.</span>
              <p className="text-sm text-gray-700">{r}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Answer Review */}
      {attempt.answers && attempt.answers.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Answer Review</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {attempt.answers.map((ans: any, i: number) => (
              <div key={ans.id} className={`p-4 rounded-lg border ${
                ans.isCorrect === true ? 'border-green-200 bg-green-50' :
                ans.isCorrect === false ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {ans.isCorrect === true && <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />}
                  {ans.isCorrect === false && <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  {ans.isCorrect === undefined && <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-gray-800">Q{i + 1}: {ans.question?.text}</p>
                </div>

                <div className="ml-6 space-y-1">
                  {ans.selectedOption && (
                    <p className="text-xs text-gray-600">Your answer: <span className="font-medium">{ans.selectedOption}</span></p>
                  )}
                  {ans.descriptiveAnswer && (
                    <p className="text-xs text-gray-600 line-clamp-2">Your answer: {ans.descriptiveAnswer}</p>
                  )}
                  <p className="text-xs text-gray-500">Marks: {ans.marksAwarded ?? 0}/{ans.question?.marks}</p>
                  {ans.aiEvaluation && (
                    <p className="text-xs text-blue-700 mt-1 italic">{ans.aiEvaluation}</p>
                  )}
                  {ans.question?.explanation && (
                    <p className="text-xs text-green-700 mt-1">
                      <span className="font-medium">Explanation:</span> {ans.question.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/student/quizzes">
          <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back to Quizzes
          </button>
        </Link>
        <Link href="/student/reports">
          <button className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            View All Reports
          </button>
        </Link>
      </div>
    </div>
  );
}
