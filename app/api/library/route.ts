import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const gameStatusSchema = z.enum(['backlog', 'playing', 'completed', 'dropped', 'wishlist']);
type GameStatus = z.infer<typeof gameStatusSchema>;

const upsertLibrarySchema = z.object({
  gameId: z.number().int().positive(),
  name: z.string().trim().min(1).max(200),
  backgroundImage: z.string().url().optional().nullable(),
  status: gameStatusSchema,
  rating: z.number().int().min(1).max(10).optional().nullable(),
  hoursPlayed: z.number().int().min(0).optional().nullable(),
  review: z.string().max(2000).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const statusParam = request.nextUrl.searchParams.get('status');
  const statusValues = gameStatusSchema.options;
  const status =
    statusParam && statusValues.includes(statusParam as GameStatus)
      ? (statusParam as GameStatus)
      : undefined;

  const items = await prisma.libraryItem.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = upsertLibrarySchema.parse(await request.json());

    const existing = await prisma.libraryItem.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: payload.gameId,
        },
      },
    });

    const now = new Date();

    const item = await prisma.libraryItem.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: payload.gameId,
        },
      },
      create: {
        userId: session.user.id,
        gameId: payload.gameId,
        name: payload.name,
        backgroundImage: payload.backgroundImage ?? undefined,
        status: payload.status,
        rating: payload.rating ?? undefined,
        hoursPlayed: payload.hoursPlayed ?? undefined,
        review: payload.review ?? undefined,
        progress: payload.progress ?? undefined,
        startedAt: payload.status === 'playing' ? now : undefined,
        completedAt: payload.status === 'completed' ? now : undefined,
      },
      update: {
        name: payload.name,
        backgroundImage: payload.backgroundImage ?? undefined,
        status: payload.status,
        rating: payload.rating ?? undefined,
        hoursPlayed: payload.hoursPlayed ?? undefined,
        review: payload.review ?? undefined,
        progress: payload.progress ?? undefined,
        startedAt:
          payload.status === 'playing'
            ? (existing?.startedAt ?? now)
            : existing?.startedAt,
        completedAt:
          payload.status === 'completed'
            ? (existing?.completedAt ?? now)
            : existing?.completedAt,
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload.', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: 'Failed to upsert library item.', details: message }, { status: 500 });
  }
}
