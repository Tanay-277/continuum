'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookmarkCheck, CheckCircle2, LogIn, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LibraryApiError,
  type LibraryItem,
  useDeleteLibraryItem,
  useLibrary,
  useUpsertLibraryItem,
} from '@/hooks/use-library';

export default function BacklogPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const isSessionLoading = sessionStatus === 'loading';

  const { data: backlogItems = [], isLoading, error } = useLibrary('backlog', {
    enabled: isAuthenticated,
  });

  const upsertLibraryItem = useUpsertLibraryItem();
  const deleteLibraryItem = useDeleteLibraryItem();

  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const sortedBacklog = useMemo(() => {
    return [...backlogItems].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [backlogItems]);

  const requiresSignIn =
    sessionStatus === 'unauthenticated' || (error instanceof LibraryApiError && error.status === 401);

  const isBusy = upsertLibraryItem.isPending || deleteLibraryItem.isPending;

  const redirectToSignIn = () => {
    router.push('/auth/signin?callbackUrl=%2Fbacklog');
  };

  const handleMarkCompleted = async (item: LibraryItem) => {
    setActionError(null);
    setActiveGameId(item.gameId);

    try {
      await upsertLibraryItem.mutateAsync({
        gameId: item.gameId,
        name: item.name,
        backgroundImage: item.backgroundImage,
        status: 'completed',
        rating: item.rating,
        hoursPlayed: item.hoursPlayed,
        review: item.review,
        progress: item.progress,
      });
    } catch (mutationError) {
      if (mutationError instanceof LibraryApiError && mutationError.status === 401) {
        redirectToSignIn();
        return;
      }

      setActionError(mutationError instanceof Error ? mutationError.message : 'Failed to update game status.');
    } finally {
      setActiveGameId(null);
    }
  };

  const handleRemove = async (gameId: number) => {
    setActionError(null);
    setActiveGameId(gameId);

    try {
      await deleteLibraryItem.mutateAsync(gameId);
    } catch (mutationError) {
      if (mutationError instanceof LibraryApiError && mutationError.status === 401) {
        redirectToSignIn();
        return;
      }

      setActionError(mutationError instanceof Error ? mutationError.message : 'Failed to remove game.');
    } finally {
      setActiveGameId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-350 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="apple-surface apple-card-shadow rounded-[32px] border border-white/10 p-8 sm:p-10">
        <p className="apple-caption mb-2">Library</p>
        <h1 className="apple-title text-4xl font-semibold sm:text-5xl">Your Backlog</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Queue up games you want to play next and keep your personal watchlist organized.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button className="rounded-full px-6" onClick={() => router.push('/')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
          <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-sm">
            <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />
            {sortedBacklog.length} queued
          </Badge>
        </div>
      </div>

      {isSessionLoading ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`backlog-loading-${index}`} className="apple-surface animate-pulse rounded-3xl border border-white/10 p-4">
              <div className="mb-4 h-36 rounded-2xl bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </section>
      ) : null}

      {!isSessionLoading && requiresSignIn ? (
        <div className="apple-surface mt-8 rounded-3xl border border-white/10 p-10 text-center">
          <h2 className="text-2xl font-semibold">Sign in to access your backlog</h2>
          <p className="mt-2 text-muted-foreground">
            Your library is tied to your account and syncs across devices.
          </p>
          <Button onClick={redirectToSignIn} className="mt-6 rounded-full px-6">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      ) : null}

      {!isSessionLoading && !requiresSignIn && isLoading ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`backlog-query-loading-${index}`} className="apple-surface animate-pulse rounded-3xl border border-white/10 p-4">
              <div className="mb-4 h-36 rounded-2xl bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </section>
      ) : null}

      {!isSessionLoading && !requiresSignIn && !isLoading && error ? (
        <div className="apple-surface mt-8 rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
          {error instanceof Error ? error.message : 'Failed to load backlog.'}
        </div>
      ) : null}

      {!isSessionLoading && !requiresSignIn && !isLoading && !error && sortedBacklog.length === 0 ? (
        <div className="apple-surface mt-8 rounded-3xl border border-white/10 p-10 text-center">
          <p className="text-lg text-muted-foreground">
            Your backlog is empty. Add games from Discover to start tracking what to play next.
          </p>
        </div>
      ) : null}

      {!isSessionLoading && !requiresSignIn && !isLoading && !error && sortedBacklog.length > 0 ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedBacklog.map((item) => {
            const isItemPending = isBusy && activeGameId === item.gameId;
            const updatedLabel = new Date(item.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <article key={item.id} className="apple-surface rounded-3xl border border-white/10 p-4">
                <Link href={`/games/${item.gameId}`} className="block">
                  <div className="relative mb-4 h-36 overflow-hidden rounded-2xl bg-muted/70">
                    {item.backgroundImage ? (
                      <Image
                        src={item.backgroundImage}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No artwork available
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent" />
                  </div>

                  <h2 className="line-clamp-2 text-xl font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Updated {updatedLabel}</p>
                </Link>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-full"
                    disabled={isItemPending}
                    onClick={() => void handleMarkCompleted(item)}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Complete
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white/20"
                    disabled={isItemPending}
                    onClick={() => void handleRemove(item.gameId)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove from backlog</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {actionError ? (
        <p className="mt-4 text-sm text-rose-200">{actionError}</p>
      ) : null}
    </div>
  );
}
