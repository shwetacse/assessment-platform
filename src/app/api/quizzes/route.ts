import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ok, created, fromZodError } from '@/lib/api-response';
import { requireAdmin, requireAuth } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['MCQ', 'DESCRIPTIVE', 'MIXED']),
  knowledgeBaseId: z.string().min(1, 'Knowledge base is required'),
  scheduledAt: z.string().nullable().optional(),
  duration: z.number().min(5).max(180),
  passingMarks: z.number().min(0),
  instructions: z.string().optional(),
});

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();

  if (user.role === 'ADMIN') {
    const quizzes = await prisma.quiz.findMany({
      where: { adminId: user.id },
      include: {
        knowledgeBase: { select: { title: true } },
        _count: { select: { attempts: true, enrollments: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(quizzes);
  }

  const now = new Date();
  const quizzes = await prisma.quiz.findMany({
    where: {
      OR: [
        { status: 'ACTIVE' },
        { status: 'SCHEDULED', scheduledAt: { lte: now } },
      ],
    },
    include: {
      knowledgeBase: { select: { title: true } },
      admin: { select: { name: true } },
      enrollments: { where: { studentId: user.id } },
      _count: { select: { questions: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  return ok(quizzes);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const admin = await requireAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { scheduledAt, ...rest } = parsed.data;
  const quiz = await prisma.quiz.create({
    data: {
      ...rest,
      adminId: admin.id,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
    },
  });

  return created(quiz);
});
