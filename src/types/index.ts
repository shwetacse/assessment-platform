export type Role = 'ADMIN' | 'STUDENT';
export type QuizType = 'MCQ' | 'DESCRIPTIVE' | 'MIXED';
export type QuizStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED';
export type QuestionType = 'MCQ' | 'DESCRIPTIVE';

export interface MCQOption {
  id: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  rollNumber?: string;
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  description?: string;
  content: string;
  topics: string[];
  adminId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { quizzes: number };
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  options?: MCQOption[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  order: number;
  topic?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  type: QuizType;
  status: QuizStatus;
  knowledgeBaseId: string;
  adminId: string;
  scheduledAt?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  knowledgeBase?: { title: string };
  admin?: { name: string };
  _count?: { attempts: number; enrollments: number };
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption?: string;
  descriptiveAnswer?: string;
  marksAwarded?: number;
  aiEvaluation?: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalMarks: number;
  percentage?: number;
  status: AttemptStatus;
  timeTaken?: number;
  quiz?: Quiz;
  student?: User;
  answers?: Answer[];
  report?: AssessmentReport;
}

export interface TopicAnalysis {
  topic: string;
  score: number;
  total: number;
  percentage: number;
}

export interface AssessmentReport {
  id: string;
  attemptId: string;
  studentId: string;
  quizId: string;
  overallScore: number;
  percentage: number;
  grade: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  topicAnalysis: TopicAnalysis[];
  placementReadiness: number;
  generatedAt: string;
  attempt?: QuizAttempt;
}

export interface AdminStats {
  totalStudents: number;
  totalQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  recentAttempts: QuizAttempt[];
  quizStatusCounts: Record<QuizStatus, number>;
}
