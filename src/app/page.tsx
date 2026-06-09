import Link from 'next/link';
import { GraduationCap, Brain, BarChart3, Clock, CheckCircle, Trophy } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Generated Questions',
    desc: 'Claude AI creates high-quality MCQ and descriptive questions from your knowledge base automatically.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: CheckCircle,
    title: 'Instant Auto-Evaluation',
    desc: 'MCQs are graded immediately. Descriptive answers are AI-evaluated with detailed feedback.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Analytics',
    desc: 'Topic-wise performance, placement readiness scores, and trend analysis for every student.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Clock,
    title: 'Scheduled Quizzes',
    desc: 'Admins schedule quizzes in advance. Students get notified and can attempt at the right time.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Trophy,
    title: 'Placement Readiness',
    desc: 'Every report includes a placement readiness score and actionable recommendations.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: GraduationCap,
    title: 'Dual Dashboards',
    desc: 'Separate dashboards for admins and students with role-specific insights and actions.',
    color: 'bg-red-100 text-red-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">PlacePrep</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Brain className="h-4 w-4" />
          AI-Powered Placement Preparation
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get Your Students<br />
          <span className="text-primary-600">Placement Ready</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          An intelligent assessment platform that generates quizzes from your knowledge base,
          evaluates answers with AI, and gives students a clear path to placement success.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            Start Free Today
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { value: 'AI', label: 'Question Generation' },
            { value: '2', label: 'Question Types (MCQ + Descriptive)' },
            { value: '∞', label: 'Knowledge Bases' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-bold">{s.value}</p>
              <p className="text-primary-200 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to assess & improve</h2>
          <p className="text-gray-500 text-lg">From question generation to detailed reports — one platform does it all.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
              <div className={`p-3 rounded-lg inline-flex mb-4 ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to transform placement preparation?</h2>
        <p className="text-gray-500 mb-8">Join as an admin to manage quizzes, or as a student to start preparing.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register?role=ADMIN" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Register as Admin
          </Link>
          <Link href="/register?role=STUDENT" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Register as Student
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} PlacePrep · AI-Powered Placement Assessment Platform
      </footer>
    </div>
  );
}
