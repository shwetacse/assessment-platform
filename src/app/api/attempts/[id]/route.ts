import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, notFound } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

type Params = { params: { id: string } };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  await requireAuth();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.id },
    include: {
      quiz: {
        include: {
          questions: { orderBy: { order: 'asc' } },
          knowledgeBase: { select: { title: true } },
        },
      },
      student: { select: { name: true, email: true } },
      answers: true,
      report: true,
    },
  });

  return attempt ? ok(attempt) : notFound('Attempt');
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  await requireAuth();
  const { questionId, selectedOption, descriptiveAnswer } = await req.json();

  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId: params.id, questionId } },
    create: { attemptId: params.id, questionId, selectedOption, descriptiveAnswer },
    update: { selectedOption, descriptiveAnswer },
  });

  return ok({ saved: true });
});
