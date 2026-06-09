'use client';
import { useEffect, useState } from 'react';
import { Plus, BookOpen, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import type { KnowledgeBase } from '@/types';

export default function KnowledgeBasePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', content: '', topicsRaw: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then(r => r.json())
      .then(data => { setKbs(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const topics = form.topicsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const res = await fetch('/api/knowledge-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, topics }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }

    setKbs(prev => [data, ...prev]);
    setOpen(false);
    setForm({ title: '', description: '', content: '', topicsRaw: '' });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this knowledge base?')) return;
    await fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
    setKbs(prev => prev.filter(k => k.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-1">Add content to generate quiz questions from</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Knowledge Base
        </Button>
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : kbs.length === 0
          ? (
            <Card>
              <CardContent className="text-center py-16">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700">No knowledge bases yet</h3>
                <p className="text-gray-400 text-sm mt-1">Add your first knowledge base to generate questions from.</p>
                <Button className="mt-4" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add First Knowledge Base
                </Button>
              </CardContent>
            </Card>
          )
          : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {kbs.map(kb => (
                <Card key={kb.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary-600" />
                          <h3 className="font-semibold text-gray-900">{kb.title}</h3>
                        </div>
                        {kb.description && (
                          <p className="text-sm text-gray-500 mt-1">{kb.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(kb.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {kb.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {kb.topics.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                            <Tag className="h-2.5 w-2.5" />{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{(kb.content.length / 1000).toFixed(1)}K chars</span>
                      <span>{kb._count?.quizzes ?? 0} quizzes</span>
                      <span>{formatDate(kb.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
      }

      <Modal open={open} onClose={() => setOpen(false)} title="New Knowledge Base" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Data Structures & Algorithms"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <Input
            label="Description (optional)"
            placeholder="Brief overview of this knowledge base"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Topics (comma-separated)"
            placeholder="Arrays, Trees, Graphs, Dynamic Programming"
            value={form.topicsRaw}
            onChange={e => setForm(f => ({ ...f, topicsRaw: e.target.value }))}
            hint="Topics help organize questions by category"
          />
          <Textarea
            label="Knowledge Base Content"
            placeholder="Paste your study material, notes, or reference content here. Claude AI will use this to generate questions..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={10}
            required
            hint="Minimum 50 characters. The more detailed, the better the questions."
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Knowledge Base</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
