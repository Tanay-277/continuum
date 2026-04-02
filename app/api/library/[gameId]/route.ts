import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const gameStatusSchema = z.enum(['backlog', 'playing', 'completed', 'dropped', 'wishlist']);

const updateLibrarySchema = z.object({
  status: gameStatusSchema.optional(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  hoursPlayed: z.number().int().min(0).optional().nullable(),
  review: z.string().max(2000).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { gameId } = await context.params;
    const parsedGameId = Number(gameId);

    if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
      return NextResponse.json({ error: 'Invalid game id.' }, { status: 400 });
    }

    const payload = updateLibrarySchema.parse(await request.json());

    const existing = await prisma.libraryItem.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: parsedGameId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Library item not found.' }, { status: 404 });
    }

    const now = new Date();

    const item = await prisma.libraryItem.update({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: parsedGameId,
        },
      },
      data: {
        ...(payload.status ? { status: payload.status } : {}),
        ...(payload.rating !== undefined ? { rating: payload.rating ?? null } : {}),
        ...(payload.hoursPlayed !== undefined ? { hoursPlayed: payload.hoursPlayed ?? null } : {}),
        ...(payload.review !== undefined ? { review: payload.review ?? null } : {}),
        ...(payload.progress !== undefined ? { progress: payload.progress ?? null } : {}),
        ...(payload.status === 'playing'
          ? { startedAt: existing.startedAt ?? now }
          : {}),
        ...(payload.status === 'completed'
          ? { completedAt: existing.completedAt ?? now }
          : {}),
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
    return NextResponse.json({ error: 'Failed to update library item.', details: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gameId } = await context.params;
  const parsedGameId = Number(gameId);

  if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
    return NextResponse.json({ error: 'Invalid game id.' }, { status: 400 });
  }

  await prisma.libraryItem.deleteMany({
    where: {
      userId: session.user.id,
      gameId: parsedGameId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
