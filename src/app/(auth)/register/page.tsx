'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: (params.get('role') as 'ADMIN' | 'STUDENT') || 'STUDENT',
    department: '',
    rollNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-primary-600 rounded-xl mb-4">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 text-sm mt-1">Join PlacePrep to get placement ready</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {(['STUDENT', 'ADMIN'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  form.role === r
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-400'
                }`}
              >
                {r === 'STUDENT' ? 'Student' : 'Admin / Teacher'}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="John Doe"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />

        {form.role === 'STUDENT' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department"
              placeholder="CSE"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            />
            <Input
              label="Roll Number"
              placeholder="21CS001"
              value={form.rollNumber}
              onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))}
            />
          </div>
        )}

        <Input
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={form.confirmPassword}
          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          required
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
