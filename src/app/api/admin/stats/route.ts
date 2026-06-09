import { ok } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';
import { prisma } from '@/lib/db';

export const GET = withErrorHandling(async () => {
  const admin = await requireAdmin();

  const [totalStudents, totalQuizzes, totalAttempts, avgScoreResult, recentAttempts, quizGroups] =
    await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.quiz.count({ where: { adminId: admin.id } }),
      prisma.quizAttempt.count({ where: { quiz: { adminId: admin.id } } }),
      prisma.quizAttempt.aggregate({
        where: { quiz: { adminId: admin.id }, status: 'EVALUATED' },
        _avg: { percentage: true },
      }),
      prisma.quizAttempt.findMany({
        where: { quiz: { adminId: admin.id } },
        include: {
          student: { select: { name: true, email: true } },
          quiz: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.quiz.groupBy({
        by: ['status'],
        where: { adminId: admin.id },
        _count: { id: true },
      }),
    ]);

  const quizStatusCounts = Object.fromEntries(quizGroups.map(q => [q.status, q._count.id]));

  return ok({
    totalStudents,
    totalQuizzes,
    totalAttempts,
    avgScore: Math.round(avgScoreResult._avg.percentage ?? 0),
    recentAttempts,
    quizStatusCounts,
  });
});
