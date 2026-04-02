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
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl opacity-50">🎮</div>
        <h3 className="mb-2 text-xl font-bold">No Games Found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Game Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <GameCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && !error && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="text-center text-sm text-muted-foreground">
            {isLoading ? 'Loading more games...' : 'Scroll for more'}
          </div>
        </div>
      )}

      {/* Error during pagination */}
      {error && games.length > 0 && (
        <Alert variant="destructive" className="mx-auto max-w-md">
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
