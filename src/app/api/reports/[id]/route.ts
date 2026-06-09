import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, notFound } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await requireAuth();

  const report = await prisma.assessmentReport.findUnique({
    where: { id: params.id },
    include: {
      attempt: {
        include: {
          quiz: { select: { title: true, type: true, duration: true } },
          student: { select: { name: true, email: true, rollNumber: true, department: true } },
          answers: {
            include: {
              question: { select: { text: true, type: true, marks: true, explanation: true } },
            },
          },
        },
      },
    },
  });

  return report ? ok(report) : notFound('Report');
});
