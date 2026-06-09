'use client';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    const role = session?.user?.role;

    router.push(role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-primary-600 rounded-xl mb-4">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your PlacePrep account</p>
      </div>

      {params.get('error') === 'OAuthAccountNotLinked' && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          Account exists with different provider.
        </div>
      )}

      {params.get('registered') && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Account created successfully! Please sign in.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-600 font-medium hover:underline">
          Register here
        </Link>
      </p>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400 mb-3">Demo Credentials</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700 mb-1">Admin</p>
            <p className="text-gray-500">admin@placeprep.com</p>
            <p className="text-gray-500">admin123</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700 mb-1">Student</p>
            <p className="text-gray-500">student@placeprep.com</p>
            <p className="text-gray-500">student123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
