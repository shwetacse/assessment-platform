'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wand2, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime, formatDuration } from '@/lib/utils';
import type { Quiz, Question } from '@/types';

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genModal, setGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ count: 10, replaceExisting: false });
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch(`/api/quizzes/${id}`);
    const data = await res.json();
    setQuiz(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError('');

    const res = await fetch(`/api/quizzes/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genForm),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Generation failed'); setGenerating(false); return; }

    setGenModal(false);
    setGenerating(false);
    await load();
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!quiz) return <p className="text-gray-500">Quiz not found</p>;

  const questions = quiz.questions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/quizzes">
          <button className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <StatusBadge status={quiz.status} />
            <StatusBadge status={quiz.type} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{quiz.description}</p>
        </div>
        <Button onClick={() => setGenModal(true)}>
          <Wand2 className="h-4 w-4" />
          {questions.length > 0 ? 'Regenerate' : 'Generate Questions'}
        </Button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Duration', value: formatDuration(quiz.duration) },
          { label: 'Total Marks', value: quiz.totalMarks },
          { label: 'Passing Marks', value: quiz.passingMarks },
          { label: 'Questions', value: questions.length },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="py-3">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {quiz.scheduledAt && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          Scheduled: {formatDateTime(quiz.scheduledAt)}
        </div>
      )}

      {quiz.instructions && (
        <Card>
          <CardContent className="py-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Instructions</p>
            <p className="text-sm text-gray-700">{quiz.instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold text-gray-900">Questions ({questions.length})</h2>
          {questions.length > 0 && (
            <button onClick={() => { setGenForm(f => ({ ...f, replaceExisting: true })); setGenModal(true); }}
              className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Replace All
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 && (
            <div className="text-center py-12">
              <Wand2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No questions yet. Click &ldquo;Generate Questions&rdquo; to use AI.</p>
            </div>
          )}
          {questions.map((q: Question, i: number) => (
            <div key={q.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
              >
                <span className="text-sm font-medium text-gray-400 w-6 shrink-0">Q{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-gray-900 line-clamp-1">{q.text}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={q.type} />
                  <span className="text-xs text-gray-400">{q.marks}m</span>
                  {expandedQ === q.id
                    ? <ChevronUp className="h-4 w-4 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 text-gray-400" />
                  }
                </div>
              </button>

              {expandedQ === q.id && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-700 mt-3 mb-3">{q.text}</p>
                  {q.topic && (
                    <p className="text-xs text-primary-600 mb-2">Topic: {q.topic}</p>
                  )}
                  {q.options && (
                    <div className="space-y-1.5 mb-3">
                      {(Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)).map((opt: { id: string; text: string }) => (
                        <div key={opt.id} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                          opt.id === q.correctAnswer ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600'
                        }`}>
                          {opt.id === q.correctAnswer
                            ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            : <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                          }
                          <span className="font-medium mr-1">{opt.id}.</span> {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-1">Explanation</p>
                      <p className="text-xs text-blue-600">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Modal open={genModal} onClose={() => setGenModal(false)} title="Generate Questions with AI">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <input
              type="number" min={1} max={30}
              value={genForm.count}
              onChange={e => setGenForm(f => ({ ...f, count: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {questions.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={genForm.replaceExisting}
                onChange={e => setGenForm(f => ({ ...f, replaceExisting: e.target.checked }))}
                className="rounded"
              />
              <span className="text-gray-700">Replace existing {questions.length} question(s)</span>
            </label>
          )}

          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            Claude AI will generate {genForm.count} {quiz.type} question(s) from the knowledge base.
            This may take 15-30 seconds.
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setGenModal(false)}>Cancel</Button>
            <Button type="submit" loading={generating}>
              <Wand2 className="h-4 w-4" /> Generate with AI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
