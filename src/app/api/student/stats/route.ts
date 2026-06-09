import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const studentId = (session.user as any).id;

  const [attempts, reports] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quiz: { select: { title: true, type: true } },
        report: { select: { placementReadiness: true, grade: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assessmentReport.findMany({
      where: { studentId },
      orderBy: { generatedAt: 'desc' },
      take: 1,
    }),
  ]);

  const evaluated = attempts.filter(a => a.status === 'EVALUATED');
  const avgScore = evaluated.length
    ? Math.round(evaluated.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / evaluated.length)
    : 0;

  return NextResponse.json({
    totalAttempts: attempts.length,
    evaluated: evaluated.length,
    avgScore,
    latestReadiness: reports[0]?.placementReadiness ?? 0,
    attempts,
  });
}
