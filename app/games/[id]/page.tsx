'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRAWGGame } from '@/hooks/use-games';
import Image from 'next/image';
import { ArrowLeft, Star, Calendar, Trophy, ExternalLink, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformList } from '@/components/platform-badge';
import { cn } from '@/lib/utils';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);

  const { data: game, isLoading, error } = useRAWGGame(gameId);

  if (isLoading) {
    return <GameDetailsSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Game Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            The game you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/')}>
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
    if (score >= 4.5) return 'text-green-400';
    if (score >= 4.0) return 'text-cyan-400';
    if (score >= 3.0) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getMetacriticColor = (score: number) => {
    if (score >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        {/* Background Image */}
        {game.background_image && (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />

        {/* Back Button */}
        <div className="absolute left-4 top-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="glass-effect border-border/50 hover:border-primary/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Title and Quick Info */}
        <div className="container absolute bottom-0 left-0 right-0 mx-auto px-4 pb-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {game.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
                  <Star className={cn('h-5 w-5 fill-current', getRatingColor(rating))} />
                  <span className="text-lg font-bold">{rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({game.ratings_count?.toLocaleString() || 0})
                  </span>
                </div>
              )}

              {/* Metacritic */}
              {game.metacritic && (
                <Badge
                  variant="outline"
                  className={cn('px-3 py-1 text-base font-bold', getMetacriticColor(game.metacritic))}
                >
                  {game.metacritic} Metacritic
                </Badge>
              )}

              {/* Release Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{releaseDate}</span>
              </div>
            </div>

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <PlatformList
                platforms={game.platforms.map((p: any) => p.platform?.name || p.platform)}
                maxDisplay={6}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">About</h2>
              {game.description_raw ? (
                <div className="prose prose-invert max-w-none text-muted-foreground">
                  {game.description_raw}
                </div>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </section>

            {/* Screenshots */}
            {game.short_screenshots && game.short_screenshots.length > 1 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold">Screenshots</h2>
                <div className="grid grid-cols-2 gap-4">
                  {game.short_screenshots.slice(1, 7).map((screenshot: any, index: number) => (
                    <div
                      key={screenshot.id || index}
                      className="group relative aspect-video overflow-hidden rounded-lg"
                    >
                      <Image
                        src={screenshot.image}
                        alt={`${game.name} screenshot ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="space-y-4 p-6">
                {/* Genres */}
                {game.genres && game.genres.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Genres</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.map((genre: any) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developers */}
                {game.developers && game.developers.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Developers</h3>
                    <p className="text-sm">
                      {game.developers.map((dev: any) => dev.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Publishers */}
                {game.publishers && game.publishers.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Publishers</h3>
                    <p className="text-sm">
                      {game.publishers.map((pub: any) => pub.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Playtime */}
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

                {/* ESRB Rating */}
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

            {/* Links */}
            {(game.website || game.reddit_url || game.metacritic_url) && (
              <Card className="border-border/50 bg-card/50">
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Gamepad2 className="mr-2 h-5 w-5" />
                Add to Backlog
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Trophy className="mr-2 h-5 w-5" />
                Mark as Completed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] min-h-[400px] w-full animate-pulse bg-muted">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-8">
          <div className="container mx-auto">
            <div className="mb-4 h-12 w-3/4 rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-10 w-32 rounded bg-muted" />
              <div className="h-10 w-32 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
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
