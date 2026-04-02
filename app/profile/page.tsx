'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Clock3, Gamepad2, LogIn, Star, Trophy, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LibraryApiError, useLibrary, useLibraryStats } from '@/hooks/use-library';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const isSessionLoading = sessionStatus === 'loading';

  const { data: stats, isLoading: statsLoading, error: statsError } = useLibraryStats({
    enabled: isAuthenticated,
  });

  const { data: allItems = [] } = useLibrary(undefined, {
    enabled: isAuthenticated,
  });

  const requiresSignIn =
    sessionStatus === 'unauthenticated' ||
    (statsError instanceof LibraryApiError && statsError.status === 401);

  const recentActivity = useMemo(() => {
    return [...allItems]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [allItems]);

  const profileStats = [
    {
      label: 'Games Tracked',
      value: stats?.totalGames ?? 0,
      icon: UserRound,
    },
    {
      label: 'Hours Played',
      value: `${stats?.totalHours ?? 0}h`,
      icon: Clock3,
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) ?? '0.0',
      icon: Star,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-350 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="apple-surface apple-card-shadow rounded-[32px] border border-white/10 p-8 sm:p-10">
        <p className="apple-caption mb-2">Profile</p>
        <h1 className="apple-title text-4xl font-semibold sm:text-5xl">Player Dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {session?.user?.name
            ? `Welcome back, ${session.user.name}. Here is a snapshot of your library progress.`
            : 'Personal analytics and preferences will appear here as you track more titles.'}
        </p>
      </div>

      {isSessionLoading ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`profile-loading-${index}`} className="apple-surface animate-pulse rounded-3xl border border-white/10 p-6">
              <div className="mb-4 h-10 w-10 rounded-2xl bg-muted" />
              <div className="h-8 w-1/2 rounded bg-muted" />
              <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </section>
      ) : null}

      {!isSessionLoading && requiresSignIn ? (
        <div className="apple-surface mt-8 rounded-3xl border border-white/10 p-10 text-center">
          <h2 className="text-2xl font-semibold">Sign in to view your dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Track your backlog, completion history, and progress in one place.
          </p>
          <Button className="mt-6 rounded-full px-6" onClick={() => router.push('/auth/signin?callbackUrl=%2Fprofile')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      ) : null}

      {!isSessionLoading && !requiresSignIn ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {profileStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="apple-surface rounded-3xl border border-white/10 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-5 w-5 text-foreground/90" />
                </div>
                <p className="text-3xl font-semibold">{statsLoading ? '--' : stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </article>
            );
          })}
        </section>
      ) : null}

      {!isSessionLoading && !requiresSignIn ? (
        <Card className="apple-surface mt-8 rounded-3xl border-white/10 bg-card/55">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="apple-title text-2xl font-semibold">Recent Activity</h2>
              <Link href="/backlog" className="text-sm text-muted-foreground hover:text-foreground">
                Open Library
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">
                No activity yet. Add a game to backlog from Discover to start tracking progress.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const updatedLabel = new Date(item.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  const statusLabel =
                    item.status === 'completed'
                      ? 'Completed'
                      : item.status === 'backlog'
                        ? 'Backlog'
                        : item.status === 'playing'
                          ? 'Playing'
                          : item.status;

                  return (
                    <Link
                      key={item.id}
                      href={`/games/${item.gameId}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-3 transition-colors hover:bg-white/8"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Updated {updatedLabel}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-foreground/90">
                        {item.status === 'completed' ? (
                          <Trophy className="h-3.5 w-3.5" />
                        ) : (
                          <Gamepad2 className="h-3.5 w-3.5" />
                        )}
                        {statusLabel}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
