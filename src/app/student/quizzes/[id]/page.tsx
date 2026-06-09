'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Progress } from '@/components/ui/Progress';
import type { Quiz, QuizAttempt, MCQOption } from '@/types';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizTakingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'done'>('intro');
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then(r => r.json())
      .then(data => { setQuiz(data); setLoading(false); });
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);

    // Save all pending answers
    const questions = quiz?.questions ?? [];
    await Promise.all(
      questions.map(q => {
        const ans = answers[q.id];
        if (!ans) return Promise.resolve();
        return fetch(`/api/attempts/${attempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: q.id,
            [q.type === 'MCQ' ? 'selectedOption' : 'descriptiveAnswer']: ans,
          }),
        });
      })
    );

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeTaken }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); setSubmitting(false); return; }

    setSubmitted(true);
    setPhase('done');
    router.push(`/student/quizzes/${attempt.id}/report`);
  }, [attempt, submitting, quiz?.questions, answers, router]);

  useEffect(() => {
    if (phase !== 'quiz' || !timeLeft) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, handleSubmit]);

  async function startQuiz() {
    if (!quiz) return;
    const res = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: id }),
    });
    const data = await res.json();
    setAttempt(data);
    setTimeLeft(quiz.duration * 60);
    startTimeRef.current = Date.now();
    setPhase('quiz');
  }

  async function saveAnswer(questionId: string, value: string) {
    if (!attempt) return;
    const question = quiz?.questions?.find(q => q.id === questionId);
    if (!question) return;

    setAnswers(prev => ({ ...prev, [questionId]: value }));
    await fetch(`/api/attempts/${attempt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        [question.type === 'MCQ' ? 'selectedOption' : 'descriptiveAnswer']: value,
      }),
    });
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!quiz) return <p className="text-gray-500">Quiz not found</p>;

  const questions = quiz.questions ?? [];
  const answered = Object.keys(answers).length;
  const timePct = quiz.duration > 0 ? (timeLeft / (quiz.duration * 60)) * 100 : 100;
  const timeWarning = timePct < 20;

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && <p className="text-gray-500 text-sm mt-1">{quiz.description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Questions', value: questions.length },
                { label: 'Duration', value: `${quiz.duration} min` },
                { label: 'Total Marks', value: quiz.totalMarks },
                { label: 'Passing Marks', value: quiz.passingMarks },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {quiz.instructions && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-800 mb-1">Instructions</p>
                <p className="text-sm text-blue-700">{quiz.instructions}</p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Before you start:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Answers are auto-saved as you go</li>
                    <li>• Timer starts immediately when you click Start</li>
                    <li>• Quiz auto-submits when time runs out</li>
                    <li>• You cannot pause or retake this quiz</li>
                  </ul>
                </div>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="p-4 bg-red-50 rounded-lg text-sm text-red-700">
                Questions have not been generated yet. Please check back later.
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={questions.length === 0}
              onClick={startQuiz}
            >
              Start Quiz →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted || phase === 'done') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner className="h-10 w-10 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Evaluating your answers...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment. Redirecting to your report.</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-8 px-8 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQ + 1} / {questions.length}
            </span>
            <div className="w-32">
              <Progress value={answered} max={questions.length} />
            </div>
            <span className="text-xs text-gray-400">{answered}/{questions.length} answered</span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${
            timeWarning ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className={`h-4 w-4 ${timeWarning ? 'animate-pulse' : ''}`} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Question */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  Q{currentQ + 1}
                </span>
                <span className="text-xs text-gray-400">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
                {question.topic && (
                  <span className="text-xs text-gray-400">· {question.topic}</span>
                )}
              </div>
              <p className="text-gray-900 font-medium mb-6 leading-relaxed">{question.text}</p>

              {question.type === 'MCQ' && question.options && (
                <div className="space-y-3">
                  {(Array.isArray(question.options) ? question.options : JSON.parse(question.options as any))
                    .map((opt: MCQOption) => {
                      const selected = answers[question.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => saveAnswer(question.id, opt.id)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                            selected
                              ? 'border-primary-500 bg-primary-50 text-primary-800'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                            selected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300'
                          }`}>
                            {opt.id}
                          </span>
                          {opt.text}
                        </button>
                      );
                    })}
                </div>
              )}

              {question.type === 'DESCRIPTIVE' && (
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                  rows={8}
                  placeholder="Type your answer here..."
                  value={answers[question.id] ?? ''}
                  onChange={e => saveAnswer(question.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {currentQ < questions.length - 1 ? (
              <Button onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={submitting}
                onClick={handleSubmit}
              >
                <CheckCircle className="h-4 w-4" /> Submit Quiz
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Question palette */}
        <div>
          <Card>
            <CardHeader>
              <p className="text-xs font-medium text-gray-500">Question Palette</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentQ;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-primary-600 text-white'
                          : isAnswered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-green-100 inline-block" />Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-gray-100 inline-block" />Not answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-primary-600 inline-block" />Current
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Button
              variant="danger"
              className="w-full"
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Quiz
            </Button>
            <p className="text-xs text-center text-gray-400 mt-2">
              {answered} of {questions.length} answered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
