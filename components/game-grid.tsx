'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { GameCard, GameCardSkeleton, type GameCardProps } from './game-card';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface GameGridProps {
  games: GameCardProps[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
}

export function GameGrid({
  games,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  error,
  onRetry,
  emptyMessage = 'No games found',
  className,
}: GameGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll with Intersection Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Error state
  if (error && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14">
        <Alert variant="destructive" className="apple-surface max-w-xl border border-white/20 bg-destructive/20 text-destructive-foreground">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>{error}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-fit"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!isLoading && games.length === 0) {
    return (
      <div className="apple-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 px-6 py-18 text-center">
        <div className="mb-4 text-5xl opacity-70">🎮</div>
        <h3 className="apple-title mb-2 text-2xl font-semibold">No Games Found</h3>
        <p className="max-w-md text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="reveal-up h-full"
            style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
          >
            <GameCard {...game} className="h-full" />
          </div>
        ))}

        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {hasMore && !error && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="apple-surface rounded-full px-4 py-2 text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading more games...' : 'Scroll for more'}
          </div>
        </div>
      )}

      {error && games.length > 0 && (
        <Alert variant="destructive" className="apple-surface mx-auto max-w-md border border-white/20 bg-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>{error}</span>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-fit"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
