import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

type StatsItem = {
  status: 'backlog' | 'playing' | 'completed' | 'dropped' | 'wishlist';
  hoursPlayed: number | null;
  rating: number | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = (await prisma.libraryItem.findMany({
    where: { userId: session.user.id },
    select: {
      status: true,
      hoursPlayed: true,
      rating: true,
    },
  })) as StatsItem[];

  const completed = items.filter((item) => item.status === 'completed');
  const rated = completed.filter((item) => typeof item.rating === 'number');

  const totalHours = completed.reduce((sum, item) => sum + (item.hoursPlayed || 0), 0);
  const averageRating =
    rated.length > 0 ? rated.reduce((sum, item) => sum + (item.rating || 0), 0) / rated.length : 0;

  return NextResponse.json(
    {
      totalGames: items.length,
      backlogGames: items.filter((item) => item.status === 'backlog').length,
      playingGames: items.filter((item) => item.status === 'playing').length,
      completedGames: completed.length,
      totalHours,
      averageRating: Number(averageRating.toFixed(1)),
    },
    { status: 200 }
  );
}
