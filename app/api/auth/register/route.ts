import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
    }

    const hashedPassword = await hash(payload.password, 12);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid registration payload.', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: 'Failed to register user.', details: message }, { status: 500 });
  }
}
