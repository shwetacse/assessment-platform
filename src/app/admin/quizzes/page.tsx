'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ClipboardList, Clock, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime, formatDuration } from '@/lib/utils';
import type { Quiz } from '@/types';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => r.json())
      .then(data => { setQuizzes(data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and schedule placement assessments</p>
        </div>
        <Link href="/admin/quizzes/new">
          <Button><Plus className="h-4 w-4" /> Create Quiz</Button>
        </Link>
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : quizzes.length === 0
          ? (
            <Card>
              <CardContent className="text-center py-16">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700">No quizzes yet</h3>
                <p className="text-gray-400 text-sm mt-1">Create your first quiz to get started.</p>
                <Link href="/admin/quizzes/new">
                  <Button className="mt-4"><Plus className="h-4 w-4" /> Create First Quiz</Button>
                </Link>
              </CardContent>
            </Card>
          )
          : (
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                        <StatusBadge status={quiz.status} />
                        <StatusBadge status={quiz.type} />
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatDuration(quiz.duration)}
                        </span>
                        <span>{quiz.totalMarks} marks</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{(quiz as any)._count?.attempts ?? 0} attempts
                        </span>
                        {quiz.scheduledAt && (
                          <span>Scheduled: {formatDateTime(quiz.scheduledAt)}</span>
                        )}
                        <span>KB: {quiz.knowledgeBase?.title}</span>
                      </div>
                    </div>
                    <Link href={`/admin/quizzes/${quiz.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
      }
    </div>
  );
}
