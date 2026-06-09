import Anthropic from '@anthropic-ai/sdk';
import { MCQOption, QuestionType, TopicAnalysis } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedQuestion {
  text: string;
  type: QuestionType;
  options?: MCQOption[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  topic?: string;
}

export async function generateQuestions(
  content: string,
  type: 'MCQ' | 'DESCRIPTIVE' | 'MIXED',
  count: number,
  topics?: string[]
): Promise<GeneratedQuestion[]> {
  const topicHint = topics?.length ? `Focus on these topics: ${topics.join(', ')}.` : '';

  let typeInstruction = '';
  if (type === 'MCQ') {
    typeInstruction = `Generate exactly ${count} MCQ questions.`;
  } else if (type === 'DESCRIPTIVE') {
    typeInstruction = `Generate exactly ${count} descriptive/short-answer questions.`;
  } else {
    const half = Math.ceil(count / 2);
    typeInstruction = `Generate ${half} MCQ questions and ${count - half} descriptive questions.`;
  }

  const prompt = `You are an expert placement preparation trainer. Based on the knowledge base content below, generate questions to assess students for campus placement.

${typeInstruction} ${topicHint}

Guidelines:
- Questions should test conceptual understanding, application, and problem-solving
- MCQ questions must have exactly 4 options (A, B, C, D)
- Descriptive questions should require 3-5 sentence answers
- Each question should be tagged with a topic
- Difficulty should be appropriate for placement interviews

Knowledge Base Content:
${content.slice(0, 6000)}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "text": "Question text here",
    "type": "MCQ",
    "options": [
      {"id": "A", "text": "Option A text"},
      {"id": "B", "text": "Option B text"},
      {"id": "C", "text": "Option C text"},
      {"id": "D", "text": "Option D text"}
    ],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why A is correct",
    "marks": 2,
    "topic": "Topic name"
  },
  {
    "text": "Descriptive question text here",
    "type": "DESCRIPTIVE",
    "options": null,
    "correctAnswer": null,
    "explanation": "Key points expected in the answer",
    "marks": 5,
    "topic": "Topic name"
  }
]`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse generated questions');

  const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
  return questions;
}

export async function evaluateDescriptiveAnswer(
  questionText: string,
  knowledgeContent: string,
  studentAnswer: string,
  maxMarks: number,
  expectedPoints?: string
): Promise<{ marksAwarded: number; evaluation: string }> {
  const prompt = `You are an expert evaluator for placement assessment. Evaluate the student's descriptive answer.

Question: ${questionText}

Expected Key Points (from knowledge base):
${expectedPoints || 'Based on standard concepts'}

Knowledge Base Context:
${knowledgeContent.slice(0, 2000)}

Student's Answer:
${studentAnswer}

Maximum Marks: ${maxMarks}

Evaluate based on:
1. Accuracy and correctness (40%)
2. Completeness - key points covered (30%)
3. Clarity and coherence (20%)
4. Technical depth (10%)

Return ONLY valid JSON:
{
  "marksAwarded": <number between 0 and ${maxMarks}>,
  "evaluation": "<2-3 sentences of specific feedback on what was good, what was missing, and how to improve>"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { marksAwarded: 0, evaluation: 'Evaluation failed' };

  const result = JSON.parse(jsonMatch[0]);
  return {
    marksAwarded: Math.min(Math.max(0, result.marksAwarded), maxMarks),
    evaluation: result.evaluation,
  };
}

export async function generateAssessmentReport(params: {
  studentName: string;
  quizTitle: string;
  quizType: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  topicAnalysis: TopicAnalysis[];
  answeredQuestions: Array<{
    question: string;
    type: string;
    isCorrect?: boolean;
    marksAwarded: number;
    maxMarks: number;
    evaluation?: string;
  }>;
}): Promise<{
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  placementReadiness: number;
}> {
  const topicSummary = params.topicAnalysis
    .map(t => `${t.topic}: ${t.score}/${t.total} (${t.percentage}%)`)
    .join(', ');

  const prompt = `You are a placement preparation expert. Generate a comprehensive assessment report for a student.

Student: ${params.studentName}
Quiz: ${params.quizTitle}
Quiz Type: ${params.quizType}
Score: ${params.score}/${params.totalMarks} (${params.percentage}%)
Grade: ${params.grade}
Topic Performance: ${topicSummary}

Performance Details:
- Total Questions: ${params.answeredQuestions.length}
- Correct Answers: ${params.answeredQuestions.filter(q => q.isCorrect === true).length}
- Descriptive Answers Evaluated: ${params.answeredQuestions.filter(q => q.type === 'DESCRIPTIVE').length}
- Average Marks per Question: ${(params.score / params.answeredQuestions.length).toFixed(1)}

Generate a placement-focused report. Return ONLY valid JSON:
{
  "summary": "<3-4 sentences overall performance summary with placement context>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "weaknesses": ["<specific area for improvement 1>", "<specific area for improvement 2>"],
  "recommendations": [
    "<actionable recommendation 1 for placement prep>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>",
    "<study resource or practice tip>"
  ],
  "placementReadiness": <integer 0-100 reflecting placement preparation level>
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      summary: `${params.studentName} scored ${params.percentage}% on ${params.quizTitle}.`,
      strengths: ['Completed the assessment'],
      weaknesses: ['Needs more practice'],
      recommendations: ['Review the knowledge base materials'],
      placementReadiness: Math.round(params.percentage * 0.8),
    };
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    summary: result.summary,
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    recommendations: result.recommendations || [],
    placementReadiness: Math.min(100, Math.max(0, result.placementReadiness)),
  };
}
