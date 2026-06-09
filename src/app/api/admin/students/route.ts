import { ok } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';
import { prisma } from '@/lib/db';

export const GET = withErrorHandling(async () => {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      attempts: {
        where: { status: 'EVALUATED' },
        include: { report: { select: { placementReadiness: true, grade: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(students.map(s => {
    const evaluated = s.attempts;
    const avgPercentage = evaluated.length
      ? Math.round(evaluated.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / evaluated.length)
      : null;
    const withReports = evaluated.filter(a => a.report);
    const avgPlacementReadiness = withReports.length
      ? Math.round(withReports.reduce((sum, a) => sum + (a.report?.placementReadiness ?? 0), 0) / withReports.length)
      : null;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      department: s.department,
      rollNumber: s.rollNumber,
      createdAt: s.createdAt,
      totalAttempts: s.attempts.length,
      avgPercentage,
      avgPlacementReadiness,
      lastAttempt: s.attempts[0]?.createdAt ?? null,
    };
  }));
});
