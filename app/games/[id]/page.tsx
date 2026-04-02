'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRAWGGame } from '@/hooks/use-games';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Star, Calendar, Trophy, ExternalLink, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformList } from '@/components/platform-badge';
import { cn } from '@/lib/utils';
import { LibraryApiError, useLibrary, useUpsertLibraryItem } from '@/hooks/use-library';

type NamedItem = {
  id?: number | string;
  name: string;
};

type PlatformItem = {
  platform?: {
    name?: string;
  } | string;
};

type StoreItem = {
  store?: {
    name?: string;
  };
};

type RatingItem = {
  title?: string;
  count?: number;
  percent?: number;
};

type ScreenshotItem = {
  id?: number | string;
  image: string;
};

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);
  const [scrollY, setScrollY] = useState(0);
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const { data: game, isLoading, error } = useRAWGGame(gameId);
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const { data: libraryItems = [] } = useLibrary(undefined, { enabled: isAuthenticated });
  const upsertLibraryItem = useUpsertLibraryItem();

  useEffect(() => {
    let rafId = 0;

    const onScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  if (isLoading) {
    return <GameDetailsSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-350 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="apple-surface apple-card-shadow w-full max-w-xl rounded-3xl border border-white/10 px-8 py-12 text-center">
          <h1 className="apple-title mb-4 text-4xl font-semibold">Game Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            The game you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.push('/')} className="rounded-full px-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const rating = game.rating || 0;
  const releaseDate = game.released ? new Date(game.released).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBA';

  const getRatingColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-300';
    if (score >= 4.0) return 'text-sky-300';
    if (score >= 3.0) return 'text-amber-300';
    return 'text-orange-300';
  };

  const getMetacriticColor = (score: number) => {
    if (score >= 75) return 'border-emerald-300/40 bg-emerald-300/15 text-emerald-200';
    if (score >= 50) return 'border-amber-300/40 bg-amber-300/15 text-amber-200';
    return 'border-rose-300/40 bg-rose-300/15 text-rose-200';
  };

  const scrollProgress = Math.min(scrollY / 760, 1);
  const parallaxOffset = Math.min(scrollY, 780) * 0.16;
  const heroBlur = scrollProgress * 4.2;
  const heroVeilOpacity = 0.08 + scrollProgress * 0.18;

  const genres = game.genres?.slice(0, 3).map((genre: NamedItem) => genre.name).join(' • ') || 'Unlisted';
  const developers =
    game.developers?.slice(0, 2).map((developer: NamedItem) => developer.name).join(', ') || 'Unknown';
  const tags = game.tags?.slice(0, 10).map((tag: NamedItem) => tag.name) || [];
  const stores =
    game.stores
      ?.slice(0, 6)
      .map((entry: StoreItem) => entry.store?.name)
      .filter((name: string | undefined): name is string => Boolean(name)) || [];
  const ratingsBreakdown: Array<{ title: string; count: number; percent: number }> =
    game.ratings?.slice(0, 4).map((entry: RatingItem) => ({
      title: entry.title || 'unknown',
      count: entry.count || 0,
      percent: Number(entry.percent || 0),
    })) || [];
  const shortSummary =
    game.description_raw
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 240) || 'A rich game universe with distinct mechanics, style, and progression.';

  const quickFacts = [
    {
      label: 'Release',
      value: releaseDate,
    },
    {
      label: 'Community',
      value: game.ratings_count ? `${game.ratings_count.toLocaleString()} ratings` : 'No ratings yet',
    },
    {
      label: 'Genres',
      value: genres,
    },
    {
      label: 'Studio',
      value: developers,
    },
  ];

  const libraryEntry = libraryItems.find((item) => item.gameId === game.id);
  const currentLibraryStatus = libraryEntry?.status;
  const isSavingLibrary = upsertLibraryItem.isPending;

  const redirectToSignIn = () => {
    const callbackPath = typeof window !== 'undefined' ? window.location.pathname : `/games/${game.id}`;
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  };

  const handleLibraryAction = async (nextStatus: 'backlog' | 'completed') => {
    if (!isAuthenticated) {
      redirectToSignIn();
      return;
    }

    setLibraryMessage(null);
    setLibraryError(null);

    try {
      await upsertLibraryItem.mutateAsync({
        gameId: game.id,
        name: game.name,
        backgroundImage: game.background_image || null,
        status: nextStatus,
      });

      setLibraryMessage(nextStatus === 'completed' ? 'Moved to Completed.' : 'Added to Backlog.');
    } catch (mutationError) {
      if (mutationError instanceof LibraryApiError && mutationError.status === 401) {
        redirectToSignIn();
        return;
      }

      setLibraryError(mutationError instanceof Error ? mutationError.message : 'Failed to update your library.');
    }
  };

  return (
    <div className="-mt-20 pb-16">
      <div className="relative h-[72vh] min-h-110 w-full overflow-hidden sm:h-[76vh]">
        {game.background_image && (
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.04)` }}
          >
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover object-[center_30%]"
              style={{ filter: `blur(${heroBlur}px)` }}
              priority
              quality={90}
            />
          </div>
        )}

        <div
          className="absolute inset-0 transition-[backdrop-filter,background-color] duration-150"
          style={{
            backdropFilter: `blur(${heroBlur * 0.5}px)`,
            backgroundColor: `rgb(5 12 20 / ${heroVeilOpacity})`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/58 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/78 via-background/35 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-350 px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="apple-title text-4xl font-semibold sm:text-5xl lg:text-6xl">
              {game.name}
            </h1>

            <p className="max-w-3xl text-sm text-white/80 sm:text-base">
              {shortSummary}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {rating > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
                  <Star className={cn('h-5 w-5 fill-current', getRatingColor(rating))} />
                  <span className="text-base font-semibold text-white">{rating.toFixed(1)}</span>
                  <span className="text-xs text-white/70">
                    ({game.ratings_count?.toLocaleString() || 0})
                  </span>
                </div>
              )}

              {game.metacritic && (
                <Badge
                  variant="outline"
                  className={cn('rounded-full px-3 py-1 text-sm font-semibold', getMetacriticColor(game.metacritic))}
                >
                  {game.metacritic} Metacritic
                </Badge>
              )}

              <div className="flex items-center gap-2 text-white/75">
                <Calendar className="h-4 w-4" />
                <span>{releaseDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-full px-6"
                size="lg"
                disabled={isSavingLibrary}
                onClick={() => void handleLibraryAction('backlog')}
                variant={currentLibraryStatus === 'backlog' ? 'secondary' : 'default'}
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                {currentLibraryStatus === 'backlog' ? 'In Backlog' : 'Add to Backlog'}
              </Button>

              <Button
                variant={currentLibraryStatus === 'completed' ? 'secondary' : 'outline'}
                className="rounded-full border-white/25 bg-white/10 px-6"
                size="lg"
                disabled={isSavingLibrary}
                onClick={() => void handleLibraryAction('completed')}
              >
                <Trophy className="mr-2 h-5 w-5" />
                {currentLibraryStatus === 'completed' ? 'Completed' : 'Mark as Completed'}
              </Button>
            </div>

            {!isAuthenticated ? (
              <p className="text-sm text-white/75">
                Sign in to save this game to your personal library.
              </p>
            ) : null}

            {libraryMessage ? <p className="text-sm text-emerald-200">{libraryMessage}</p> : null}
            {libraryError ? <p className="text-sm text-rose-200">{libraryError}</p> : null}

            {game.platforms && game.platforms.length > 0 && (
              <PlatformList
                platforms={game.platforms
                  .map((platform: PlatformItem) => {
                    if (typeof platform.platform === 'string') {
                      return platform.platform;
                    }

                    return platform.platform?.name || '';
                  })
                  .filter((name: string | undefined): name is string => Boolean(name))}
                maxDisplay={6}
              />
            )}
          </div>
        </div>
      </div>

      <section className="relative z-20 mx-auto -mt-9 w-full max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="apple-surface apple-card-shadow rounded-3xl border border-white/10 p-5 sm:p-6">
          <div className="mb-4 border-b border-white/10 pb-4">
            <p className="apple-caption mb-1">Game Intelligence</p>
            <p className="text-sm text-muted-foreground">
              Snapshot cards with release, audience, genre profile, and studio context.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickFacts.map((fact) => (
              <article key={fact.label} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                <p className="apple-caption mb-1">{fact.label}</p>
                <p className="line-clamp-2 text-sm text-foreground/90">{fact.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 w-full max-w-350 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="apple-surface rounded-3xl border border-white/10 p-6 sm:p-8">
              <h2 className="apple-title mb-4 text-2xl font-semibold">About</h2>
              {game.description_raw ? (
                <div className="prose prose-invert max-w-none text-muted-foreground">
                  {game.description_raw}
                </div>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </section>

            <section className="apple-surface rounded-3xl border border-white/10 p-6 sm:p-8">
              <h2 className="apple-title mb-4 text-2xl font-semibold">Play Profile</h2>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                  <p className="apple-caption mb-1">Average Playtime</p>
                  <p className="text-base font-medium text-foreground/90">{game.playtime ? `${game.playtime}h` : 'Unknown'}</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                  <p className="apple-caption mb-1">ESRB</p>
                  <p className="text-base font-medium text-foreground/90">{game.esrb_rating?.name || 'Unrated'}</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                  <p className="apple-caption mb-1">Metacritic</p>
                  <p className="text-base font-medium text-foreground/90">{game.metacritic || 'N/A'}</p>
                </article>
              </div>

              {ratingsBreakdown.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Community Breakdown</h3>
                  {ratingsBreakdown.map((entry) => (
                    <div key={entry.title} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{entry.title}</span>
                        <span>{entry.count?.toLocaleString?.() || entry.count || 0}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-white/55"
                          style={{ width: `${Math.max(4, Math.min(100, entry.percent))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {game.short_screenshots && game.short_screenshots.length > 1 && (
              <section className="apple-surface rounded-3xl border border-white/10 p-6 sm:p-8">
                <h2 className="apple-title mb-4 text-2xl font-semibold">Screenshots</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {game.short_screenshots.slice(1, 7).map((screenshot: ScreenshotItem, index: number) => (
                    <div
                      key={screenshot.id || index}
                      className="group relative aspect-video overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={screenshot.image}
                        alt={`${game.name} screenshot ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card className="apple-surface rounded-3xl border-white/10 bg-card/55">
              <CardContent className="space-y-4 p-6">
                {game.genres && game.genres.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Genres</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.map((genre: NamedItem) => (
                        <Badge key={genre.id ?? genre.name} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {game.developers && game.developers.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Developers</h3>
                    <p className="text-sm">
                      {game.developers.map((developer: NamedItem) => developer.name).join(', ')}
                    </p>
                  </div>
                )}

                {game.publishers && game.publishers.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Publishers</h3>
                    <p className="text-sm">
                      {game.publishers.map((publisher: NamedItem) => publisher.name).join(', ')}
                    </p>
                  </div>
                )}

                {game.playtime && game.playtime > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      Average Playtime
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{game.playtime} hours</span>
                    </div>
                  </div>
                )}

                {game.esrb_rating && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      ESRB Rating
                    </h3>
                    <Badge variant="outline">{game.esrb_rating.name}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {(tags.length > 0 || stores.length > 0) && (
              <Card className="apple-surface rounded-3xl border-white/10 bg-card/55">
                <CardContent className="space-y-4 p-6">
                  {tags.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {stores.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Available On</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {stores.map((store: string) => (
                          <Badge key={store} variant="outline" className="border-white/20">
                            {store}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(game.website || game.reddit_url || game.metacritic_url) && (
              <Card className="apple-surface rounded-3xl border-white/10 bg-card/55">
                <CardContent className="space-y-3 p-6">
                  <h3 className="font-semibold">Links</h3>
                  
                  {game.website && (
                    <a
                      href={game.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Official Website
                    </a>
                  )}

                  {game.reddit_url && (
                    <a
                      href={game.reddit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Reddit Community
                    </a>
                  )}

                  {game.metacritic_url && (
                    <a
                      href={game.metacritic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Metacritic Page
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GameDetailsSkeleton() {
  return (
    <div className="pb-16">
      <div className="relative h-[60vh] min-h-100 w-full animate-pulse bg-muted">
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background to-transparent p-8">
          <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
            <div className="mb-4 h-12 w-3/4 rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-10 w-32 rounded bg-muted" />
              <div className="h-10 w-32 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-350 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-8 w-32 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
