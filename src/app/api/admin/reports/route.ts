import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const reports = await prisma.assessmentReport.findMany({
    include: {
      attempt: {
        include: {
          student: { select: { name: true, email: true, rollNumber: true } },
          quiz: { select: { title: true, type: true } },
        },
      },
    },
    orderBy: { generatedAt: 'desc' },
  });

  return NextResponse.json(reports);
}
