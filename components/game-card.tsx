'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CheckCircle2, Star, Trophy, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface GameCardProps {
  id: number;
  name: string;
  backgroundImage?: string;
  rating?: number;
  ratingsCount?: number;
  released?: string;
  platforms?: string[];
  genres?: string[];
  metacritic?: number;
  playtime?: number;
  className?: string;
}

function formatCompactCount(value?: number) {
  if (!value) return '--';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function GameCard({
  id,
  name,
  backgroundImage,
  rating,
  ratingsCount,
  released,
  platforms = [],
  genres = [],
  metacritic,
  playtime,
  className,
}: GameCardProps) {
  const hasRating = typeof rating === 'number' && rating > 0;
  const ratingLabel = hasRating ? rating.toFixed(1) : 'No score';
  const releaseYear = released ? new Date(released).getFullYear() : null;
  const releaseLabel = releaseYear ? `Released ${releaseYear}` : 'Release date TBD';
  const playtimeLabel = playtime && playtime > 0 ? `${playtime}h avg playtime` : 'Playtime TBD';
  const votesLabel = formatCompactCount(ratingsCount);
  const topMeta =
    genres.length > 0
      ? genres.slice(0, 2).join(' • ')
      : platforms.length > 0
        ? platforms.slice(0, 2).join(' • ')
        : 'Game details available';

  const getRatingColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-300';
    if (score >= 4.0) return 'text-sky-300';
    if (score >= 3.0) return 'text-amber-300';
    return 'text-orange-300';
  };

  return (
    <Link href={`/games/${id}`} className="block h-full">
      <Card
        className={cn(
          'apple-surface apple-card-shadow flex h-full flex-col overflow-hidden rounded-[30px] border-white/10 bg-card/75 p-3',
          'transition-colors duration-200 hover:border-white/20',
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-muted/70">
          {backgroundImage ? (
            <Image
              src={backgroundImage}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-muted/80 to-background">
              <span className="text-3xl font-medium text-muted-foreground/55">No Art</span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-b from-sky-300/4 via-sky-700/8 to-sky-950/45" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/45 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md">
            <Star className={cn('h-4 w-4', hasRating ? `fill-current ${getRatingColor(rating)}` : 'text-white/70')} />
            <span className="text-xs font-semibold text-white">{ratingLabel}</span>
          </div>
        </div>

        <div className="flex grow flex-col px-2 pb-2 pt-4">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 min-h-15 flex-1 text-[1.85rem] leading-tight font-semibold tracking-tight text-foreground">
              {name}
            </h3>
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
          </div>

          <p className="mt-1 line-clamp-1 text-base text-foreground/85">{topMeta}</p>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{releaseLabel} • {playtimeLabel}</p>

          <div className="mt-auto pt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-foreground/90">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{releaseYear || 'TBA'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{votesLabel}</span>
              </span>
              {metacritic ? (
                <span className="inline-flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{metacritic}</span>
                </span>
              ) : null}
            </div>

            <span className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/10 px-5 text-lg font-semibold text-foreground">
              Open +
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Skeleton loader for game cards
export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('apple-surface overflow-hidden rounded-[30px] border-white/10 bg-card/60 p-3', className)}>
      <div className="animate-pulse">
        <div className="aspect-square rounded-[24px] bg-muted/70" />

        <div className="space-y-3 p-4">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />

          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>

          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </Card>
  );
}
