'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users, BarChart3, LogOut, GraduationCap,
} from 'lucide-react';

const nav = [
  { href: '/admin/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/admin/quizzes',        label: 'Quizzes',        icon: ClipboardList },
  { href: '/admin/students',       label: 'Students',       icon: Users },
  { href: '/admin/reports',        label: 'Analytics',      icon: BarChart3 },
];

export function AdminSidebar() {
  const path = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">PlacePrep</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {nav.map(item => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
