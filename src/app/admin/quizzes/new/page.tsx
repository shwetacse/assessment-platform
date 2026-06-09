'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { KnowledgeBase } from '@/types';

export default function NewQuizPage() {
  const router = useRouter();
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'MCQ' as 'MCQ' | 'DESCRIPTIVE' | 'MIXED',
    knowledgeBaseId: '',
    scheduledAt: '',
    duration: 30,
    passingMarks: 0,
    instructions: '',
  });

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then(r => r.json())
      .then(setKbs);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.knowledgeBaseId) { setError('Select a knowledge base'); return; }
    setSaving(true);
    setError('');

    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        scheduledAt: form.scheduledAt || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }

    router.push(`/admin/quizzes/${data.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/quizzes">
          <button className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
          <p className="text-gray-500 text-sm">Set up a new placement assessment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Quiz Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Quiz Title"
              placeholder="e.g. DSA Placement Mock Test 1"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Textarea
              label="Description (optional)"
              placeholder="What this quiz covers, special instructions..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['MCQ', 'DESCRIPTIVE', 'MIXED'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.type === t
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {t === 'MCQ' ? 'MCQ Only' : t === 'DESCRIPTIVE' ? 'Descriptive' : 'Mixed'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Base *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.knowledgeBaseId}
                onChange={e => setForm(f => ({ ...f, knowledgeBaseId: e.target.value }))}
                required
              >
                <option value="">Select a knowledge base...</option>
                {kbs.map(kb => (
                  <option key={kb.id} value={kb.id}>{kb.title}</option>
                ))}
              </select>
              {kbs.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  No knowledge bases found.{' '}
                  <Link href="/admin/knowledge-base" className="underline">Create one first.</Link>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={5} max={180}
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  min={0}
                  value={form.passingMarks}
                  onChange={e => setForm(f => ({ ...f, passingMarks: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to save as Draft and publish manually.</p>
            </div>

            <Textarea
              label="Instructions for Students (optional)"
              placeholder="Any specific instructions for this quiz..."
              value={form.instructions}
              onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              rows={3}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <Link href="/admin/quizzes">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={saving}>
                Create Quiz & Generate Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
