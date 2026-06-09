'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ClipboardList, FileText, LogOut, GraduationCap,
} from 'lucide-react';

const nav = [
  { href: '/student/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/student/quizzes',   label: 'My Quizzes',  icon: ClipboardList },
  { href: '/student/reports',   label: 'My Reports',  icon: FileText },
];

export function StudentSidebar() {
  const path = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">PlacePrep</p>
            <p className="text-xs text-gray-400">Student Portal</p>
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
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
