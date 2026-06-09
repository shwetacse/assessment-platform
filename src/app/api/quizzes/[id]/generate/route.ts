import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ok, notFound, fromZodError, serverError } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';
import { generateQuestions } from '@/lib/anthropic';

const schema = z.object({
  count: z.number().min(1).max(30).default(10),
  replaceExisting: z.boolean().default(false),
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireAdmin();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const { count, replaceExisting } = parsed.data;

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: { knowledgeBase: true },
  });
  if (!quiz) return notFound('Quiz');

  try {
    const questions = await generateQuestions(
      quiz.knowledgeBase.content,
      quiz.type as 'MCQ' | 'DESCRIPTIVE' | 'MIXED',
      count,
      quiz.knowledgeBase.topics
    );

    if (replaceExisting) {
      await prisma.question.deleteMany({ where: { quizId: params.id } });
    }

    const existingCount = replaceExisting
      ? 0
      : await prisma.question.count({ where: { quizId: params.id } });

    const created = await prisma.$transaction(
      questions.map((q, i) =>
        prisma.question.create({
          data: {
            quizId: params.id,
            text: q.text,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            order: existingCount + i,
            topic: q.topic,
          },
        })
      )
    );

    const agg = await prisma.question.aggregate({
      where: { quizId: params.id },
      _sum: { marks: true },
    });

    await prisma.quiz.update({
      where: { id: params.id },
      data: { totalMarks: agg._sum.marks ?? 0, status: 'ACTIVE' },
    });

    return ok({ generated: created.length, questions: created });
  } catch (err) {
    console.error('Question generation error:', err);
    return serverError('Failed to generate questions. Check your Anthropic API key.');
  }
});
