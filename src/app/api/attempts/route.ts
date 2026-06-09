import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, created, notFound } from '@/lib/api-response';
import { requireAuth, requireStudent } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const where = user.role === 'STUDENT' ? { studentId: user.id } : {};

  const attempts = await prisma.quizAttempt.findMany({
    where,
    include: {
      quiz: { select: { title: true, type: true, totalMarks: true } },
      student: { select: { name: true, email: true, rollNumber: true } },
      report: { select: { placementReadiness: true, grade: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(attempts);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const student = await requireStudent();
  const { quizId } = await req.json();

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return notFound('Quiz');

  const existing = await prisma.quizAttempt.findFirst({
    where: { quizId, studentId: student.id, status: 'IN_PROGRESS' },
  });
  if (existing) return ok(existing);

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, studentId: student.id, totalMarks: quiz.totalMarks, status: 'IN_PROGRESS' },
  });

  return created(attempt);
});
