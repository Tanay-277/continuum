'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformList } from '@/components/platform-badge';
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
  // Format rating to 1 decimal
  const formattedRating = rating ? rating.toFixed(1) : 'N/A';
  
  // Format release date
  const releaseYear = released ? new Date(released).getFullYear() : null;
  
  // Get rating color
  const getRatingColor = (score: number) => {
    if (score >= 4.5) return 'text-green-400';
    if (score >= 4.0) return 'text-cyan-400';
    if (score >= 3.0) return 'text-yellow-400';
    return 'text-orange-400';
  };
  
  // Get metacritic color
  const getMetacriticColor = (score: number) => {
    if (score >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };
  
  return (
    <Link href={`/games/${id}`} className="group block">
      <Card
        className={cn(
          'overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm',
          'transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
          'hover:-translate-y-1 will-change-transform',
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {backgroundImage ? (
            <Image
              src={backgroundImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <span className="text-4xl font-bold text-muted-foreground/20">?</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Top Right Badges */}
          <div className="absolute right-2 top-2 flex gap-1.5">
            {metacritic && (
              <Badge
                variant="outline"
                className={cn(
                  'font-bold backdrop-blur-sm',
                  getMetacriticColor(metacritic)
                )}
              >
                {metacritic}
              </Badge>
            )}
          </div>
          
          {/* Rating Overlay (on hover) */}
          {rating && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Star className={cn('h-4 w-4 fill-current', getRatingColor(rating))} />
              <span className="text-sm font-bold text-white">{formattedRating}</span>
              {ratingsCount && (
                <span className="text-xs text-white/60">
                  ({ratingsCount > 1000 ? `${(ratingsCount / 1000).toFixed(1)}k` : ratingsCount})
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="space-y-3 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-primary">
            {name}
          </h3>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {releaseYear && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{releaseYear}</span>
              </div>
            )}
            {playtime && playtime > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{playtime}h avg</span>
              </div>
            )}
          </div>
          
          {/* Platforms */}
          {platforms.length > 0 && (
            <PlatformList platforms={platforms} maxDisplay={3} variant="sm" />
          )}
          
          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 3).map((genre, index) => (
                <Badge
                  key={`${genre}-${index}`}
                  variant="secondary"
                  className="text-[10px] bg-secondary/50 hover:bg-secondary"
                >
                  {genre}
                </Badge>
              ))}
              {genres.length > 3 && (
                <Badge variant="secondary" className="text-[10px] bg-secondary/30">
                  +{genres.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton loader for game cards
export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden border-border/50 bg-card/50', className)}>
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="aspect-[16/9] bg-muted" />
        
        {/* Content skeleton */}
        <CardContent className="space-y-3 p-4">
          {/* Title skeleton */}
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          
          {/* Metadata skeleton */}
          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
          
          {/* Platforms skeleton */}
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
          
          {/* Genres skeleton */}
          <div className="flex gap-1">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
