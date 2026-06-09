import type { TopicAnalysis } from '@/types';

interface QuestionLike {
  id: string;
  topic?: string | null;
  marks: number;
}

interface AnswerScore {
  questionId: string;
  marksAwarded: number;
}

/**
 * Builds per-topic score breakdown from answered questions.
 * Pure function — no side effects.
 */
export function buildTopicAnalysis(
  questions: QuestionLike[],
  answers: AnswerScore[]
): TopicAnalysis[] {
  const topicMap = new Map<string, { score: number; total: number }>();

  for (const question of questions) {
    const topic = question.topic ?? 'General';
    const answer = answers.find(a => a.questionId === question.id);
    const existing = topicMap.get(topic) ?? { score: 0, total: 0 };
    topicMap.set(topic, {
      score: existing.score + (answer?.marksAwarded ?? 0),
      total: existing.total + question.marks,
    });
  }

  return Array.from(topicMap.entries()).map(([topic, { score, total }]) => ({
    topic,
    score,
    total,
    percentage: total > 0 ? Math.round((score / total) * 100) : 0,
  }));
}
