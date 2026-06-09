import Link from 'next/link';
import { GraduationCap, Brain, BarChart3, Clock, CheckCircle, Trophy, BookOpen, Target } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Generated Questions',
    desc: 'Claude AI generates high-quality MCQ and descriptive questions from any knowledge base — textbooks, notes, or custom content.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: CheckCircle,
    title: 'Instant Auto-Evaluation',
    desc: 'MCQs are graded instantly. Descriptive answers are AI-evaluated with detailed, personalised feedback.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Analytics',
    desc: 'Topic-wise performance breakdown, trend charts, and readiness scores for every student and every quiz.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Clock,
    title: 'Scheduled Assessments',
    desc: 'Admins schedule quizzes in advance. Students are notified and can attempt at the right time with a live countdown timer.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Target,
    title: 'Readiness Scoring',
    desc: 'Every report includes a readiness score and actionable recommendations tailored to the student\'s weak areas.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: BookOpen,
    title: 'Any Knowledge Base',
    desc: 'Paste lecture notes, textbook chapters, or course material — the platform generates assessments from any content.',
    color: 'bg-red-100 text-red-600',
  },
];

const useCases = [
  { icon: '🎓', title: 'Academic Exams', desc: 'Mid-terms, end-sems, unit tests' },
  { icon: '💼', title: 'Placement Prep', desc: 'Aptitude, technical, HR rounds' },
  { icon: '🏆', title: 'Competitive Exams', desc: 'GATE, GRE, UPSC mock tests' },
  { icon: '🛠️', title: 'Skill Assessments', desc: 'Coding, design, domain skills' },
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
            <span className="font-bold text-lg">AssessHub</span>
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
          AI-Powered Student Assessment
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Assess, Analyse &<br />
          <span className="text-primary-600">Accelerate Learning</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          One platform for all types of student assessments — academic exams, placement prep,
          competitive tests, and skill evaluations. Powered by Claude AI.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
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

      {/* Use Cases */}
      <section className="bg-gray-50 border-y border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-widest">Built for every type of assessment</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCases.map((u, i) => (
              <div key={i} className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl mb-2">{u.icon}</p>
                <p className="font-semibold text-gray-900 text-sm">{u.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { value: 'AI', label: 'Question Generation' },
            { value: '2', label: 'Question Types (MCQ + Descriptive)' },
            { value: '∞', label: 'Knowledge Bases & Topics' },
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run great assessments</h2>
          <p className="text-gray-500 text-lg">From question generation to detailed AI reports — one platform does it all.</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to transform how you assess students?</h2>
        <p className="text-gray-500 mb-8">Join as an admin to manage assessments, or as a student to start learning.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register?role=ADMIN" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Register as Admin / Teacher
          </Link>
          <Link href="/register?role=STUDENT" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Register as Student
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AssessHub · AI-Powered Student Assessment Platform
      </footer>
    </div>
  );
}
