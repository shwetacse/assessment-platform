import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, notFound, badRequest, serverError } from '@/lib/api-response';
import { requireStudent } from '@/lib/auth-guard';
import { withErrorHandling } from '@/lib/route-handler';
import { evaluateDescriptiveAnswer, generateAssessmentReport } from '@/lib/anthropic';
import { getGrade } from '@/lib/utils';
import { buildTopicAnalysis } from '@/lib/scoring';
import type { TopicAnalysis } from '@/types';

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireStudent();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.id },
    include: {
      quiz: { include: { questions: true, knowledgeBase: true } },
      student: true,
      answers: true,
    },
  });

  if (!attempt) return notFound('Attempt');
  if (attempt.status !== 'IN_PROGRESS') return badRequest('Quiz already submitted');

  const { timeTaken = 0 } = await req.json();

  try {
    const { totalScore, updatedAnswers } = await scoreAnswers(attempt);
    await applyAnswerScores(updatedAnswers);

    const totalMarks = attempt.quiz.totalMarks || 1;
    const percentage = Math.round((totalScore / totalMarks) * 100);
    const grade = getGrade(percentage);

    await prisma.quizAttempt.update({
      where: { id: params.id },
      data: { status: 'EVALUATED', submittedAt: new Date(), score: totalScore, percentage, timeTaken },
    });

    const topicAnalysis = buildTopicAnalysis(attempt.quiz.questions, updatedAnswers);
    const reportData = await generateAssessmentReport({
      studentName: attempt.student.name,
      quizTitle: attempt.quiz.title,
      quizType: attempt.quiz.type,
      score: totalScore,
      totalMarks,
      percentage,
      grade,
      topicAnalysis,
      answeredQuestions: updatedAnswers.map(ua => {
        const q = attempt.quiz.questions.find(q => q.id === ua.questionId)!;
        return { question: q?.text ?? '', type: q?.type ?? 'MCQ', isCorrect: ua.isCorrect, marksAwarded: ua.marksAwarded, maxMarks: q?.marks ?? 1, evaluation: ua.aiEvaluation };
      }),
    });

    const report = await prisma.assessmentReport.create({
      data: {
        attemptId: params.id,
        studentId: attempt.studentId,
        quizId: attempt.quizId,
        overallScore: totalScore,
        percentage,
        grade,
        summary: reportData.summary,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        topicAnalysis: topicAnalysis as any,
        placementReadiness: reportData.placementReadiness,
      },
    });

    return ok({ score: totalScore, percentage, grade, reportId: report.id });
  } catch (err) {
    console.error('Submit error:', err);
    return serverError('Submission failed');
  }
});

async function scoreAnswers(attempt: any) {
  let totalScore = 0;
  const updatedAnswers: Array<{ id: string; questionId: string; marksAwarded: number; isCorrect?: boolean; aiEvaluation?: string }> = [];

  for (const question of attempt.quiz.questions) {
    const answer = attempt.answers.find((a: any) => a.questionId === question.id);
    if (!answer) continue;

    if (question.type === 'MCQ') {
      const isCorrect = answer.selectedOption === question.correctAnswer;
      const marks = isCorrect ? question.marks : 0;
      totalScore += marks;
      updatedAnswers.push({ id: answer.id, questionId: question.id, marksAwarded: marks, isCorrect });
    } else {
      if (answer.descriptiveAnswer?.trim()) {
        const evaluation = await evaluateDescriptiveAnswer(
          question.text,
          attempt.quiz.knowledgeBase.content,
          answer.descriptiveAnswer,
          question.marks,
          question.explanation ?? undefined
        );
        totalScore += evaluation.marksAwarded;
        updatedAnswers.push({ id: answer.id, questionId: question.id, marksAwarded: evaluation.marksAwarded, aiEvaluation: evaluation.evaluation });
      } else {
        updatedAnswers.push({ id: answer.id, questionId: question.id, marksAwarded: 0 });
      }
    }
  }

  return { totalScore, updatedAnswers };
}

async function applyAnswerScores(
  answers: Array<{ id: string; marksAwarded: number; isCorrect?: boolean; aiEvaluation?: string }>
) {
  await prisma.$transaction(
    answers.map(a =>
      prisma.answer.update({
        where: { id: a.id },
        data: { marksAwarded: a.marksAwarded, isCorrect: a.isCorrect, aiEvaluation: a.aiEvaluation },
      })
    )
  );
}
