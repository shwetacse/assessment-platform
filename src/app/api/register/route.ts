import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { created, conflict, fromZodError, serverError } from '@/lib/api-response';
import { withErrorHandling } from '@/lib/route-handler';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'STUDENT']).default('STUDENT'),
  department: z.string().optional(),
  rollNumber: z.string().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { name, email, password, role, department, rollNumber } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return conflict('Email already registered');

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, department, rollNumber },
    select: { id: true, name: true, email: true, role: true },
  });

  return created(user);
});
