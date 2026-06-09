'use client';
import { useEffect, useState } from 'react';
import { Users, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate, getPlacementReadinessLabel, getPlacementReadinessColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StudentRow {
  id: string;
  name: string;
  email: string;
  department?: string;
  rollNumber?: string;
  createdAt: string;
  totalAttempts: number;
  avgPercentage: number | null;
  avgPlacementReadiness: number | null;
  lastAttempt: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(data => { setStudents(data); setLoading(false); });
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} students registered</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading
        ? <div className="flex justify-center py-12"><Spinner /></div>
        : filtered.length === 0
          ? (
            <Card>
              <CardContent className="text-center py-16">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700">No students found</h3>
              </CardContent>
            </Card>
          )
          : (
            <div className="space-y-3">
              {filtered.map(s => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-sm">
                        {s.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        {s.rollNumber && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.rollNumber}</span>
                        )}
                        {s.department && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{s.department}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{s.email}</p>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Attempts</p>
                        <p className="font-bold text-gray-900">{s.totalAttempts}</p>
                      </div>

                      <div className="w-32">
                        <p className="text-xs text-gray-400 mb-1">Avg Score</p>
                        {s.avgPercentage !== null
                          ? <Progress value={s.avgPercentage} showLabel />
                          : <p className="text-xs text-gray-300">No attempts</p>
                        }
                      </div>

                      <div className="w-36">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Placement Readiness
                        </p>
                        {s.avgPlacementReadiness !== null ? (
                          <div>
                            <Progress value={s.avgPlacementReadiness} />
                            <p className={cn('text-xs font-medium mt-0.5', getPlacementReadinessColor(s.avgPlacementReadiness))}>
                              {getPlacementReadinessLabel(s.avgPlacementReadiness)} ({s.avgPlacementReadiness}%)
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-300">No data</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Joined</p>
                        <p className="text-xs text-gray-600">{formatDate(s.createdAt)}</p>
                        {s.lastAttempt && (
                          <p className="text-xs text-gray-400">Last: {formatDate(s.lastAttempt)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
      }
    </div>
  );
}
