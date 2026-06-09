import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, notFound } from '@/lib/api-response';
import { requireAdmin, requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

type Params = { params: { id: string } };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  await requireAuth();
  const kb = await prisma.knowledgeBase.findUnique({
    where: { id: params.id },
    include: { _count: { select: { quizzes: true } } },
  });
  return kb ? ok(kb) : notFound('Knowledge base');
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Params) => {
  await requireAdmin();
  await prisma.knowledgeBase.delete({ where: { id: params.id } });
  return ok({ success: true });
});
