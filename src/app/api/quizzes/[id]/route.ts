import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, notFound } from '@/lib/api-response';
import { requireAdmin, requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

type Params = { params: { id: string } };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      knowledgeBase: { select: { title: true, content: true } },
      admin: { select: { name: true } },
      _count: { select: { attempts: true, enrollments: true } },
    },
  });

  if (!quiz) return notFound('Quiz');

  if (user.role === 'STUDENT') {
    return ok({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        correctAnswer: undefined,
        explanation: undefined,
      })),
      knowledgeBase: { title: quiz.knowledgeBase.title },
    });
  }

  return ok(quiz);
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Params) => {
  await requireAdmin();
  const body = await req.json();
  const quiz = await prisma.quiz.update({ where: { id: params.id }, data: body });
  return ok(quiz);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  await requireAdmin();
  await prisma.quiz.delete({ where: { id: params.id } });
  return ok({ success: true });
});
