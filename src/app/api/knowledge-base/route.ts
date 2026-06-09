import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ok, created, fromZodError } from '@/lib/api-response';
import { requireAdmin, requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  topics: z.array(z.string()).default([]),
});

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const where = user.role === 'ADMIN' ? { adminId: user.id } : {};

  const kbs = await prisma.knowledgeBase.findMany({
    where,
    include: { _count: { select: { quizzes: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return ok(kbs);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const admin = await requireAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const kb = await prisma.knowledgeBase.create({
    data: { ...parsed.data, adminId: admin.id },
  });

  return created(kb);
});
