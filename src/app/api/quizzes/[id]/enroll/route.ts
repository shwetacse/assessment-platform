import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { created, serverError } from '@/lib/api-response';
import { requireStudent } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

export const POST = withErrorHandling(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const student = await requireStudent();

  try {
    const enrollment = await prisma.quizEnrollment.upsert({
      where: { studentId_quizId: { studentId: student.id, quizId: params.id } },
      create: { studentId: student.id, quizId: params.id },
      update: {},
    });
    return created(enrollment);
  } catch {
    return serverError('Enrollment failed');
  }
});
