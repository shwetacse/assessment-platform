'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime, formatDuration } from '@/lib/utils';
import type { Quiz } from '@/types';

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => r.json())
      .then(data => { setQuizzes(data); setLoading(false); });
  }, []);

  const available = quizzes.filter(q => q.status === 'ACTIVE' || q.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Quizzes</h1>
        <p className="text-gray-500 text-sm mt-1">Attempt placement assessments assigned to you</p>
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : available.length === 0
          ? (
            <Card>
              <CardContent className="text-center py-16">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700">No quizzes available</h3>
                <p className="text-gray-400 text-sm mt-1">Your teacher will assign quizzes soon. Check back later.</p>
              </CardContent>
            </Card>
          )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {available.map(quiz => {
                const enrolled = (quiz as any).enrollments?.length > 0;
                const questionCount = (quiz as any)._count?.questions ?? 0;

                return (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardContent>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>
                          )}
                        </div>
                        <StatusBadge status={quiz.status} />
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDuration(quiz.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {questionCount} questions
                        </span>
                        <StatusBadge status={quiz.type} />
                        <span>{quiz.totalMarks} marks</span>
                      </div>

                      {quiz.scheduledAt && (
                        <p className="text-xs text-blue-600 mb-3">
                          Scheduled: {formatDateTime(quiz.scheduledAt)}
                        </p>
                      )}

                      {quiz.knowledgeBase && (
                        <p className="text-xs text-gray-400 mb-4">
                          Topic: {quiz.knowledgeBase.title}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Link href={`/student/quizzes/${quiz.id}`} className="flex-1">
                          <Button className="w-full" disabled={questionCount === 0}>
                            {questionCount === 0 ? 'Questions not ready' : 'Start Quiz →'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
      }
    </div>
  );
}
