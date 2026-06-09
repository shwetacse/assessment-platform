import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimeTaken(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'text-green-600';
    case 'A':  return 'text-green-500';
    case 'B+': return 'text-blue-600';
    case 'B':  return 'text-blue-500';
    case 'C':  return 'text-yellow-600';
    case 'D':  return 'text-orange-500';
    default:   return 'text-red-600';
  }
}

export function getPlacementReadinessLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Needs Improvement';
}

export function getPlacementReadinessColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 65) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 35) return 'text-orange-500';
  return 'text-red-600';
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}
