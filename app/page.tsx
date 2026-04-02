'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRAWGGames } from '@/hooks/use-games';
import { GameGrid } from '@/components/game-grid';
import { GamingSearchBar } from '@/components/search-bar';
import type { GameCardProps } from '@/components/game-card';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch games with search and pagination
  const { data, isLoading, error } = useRAWGGames({
    search: searchQuery || undefined,
    page,
    page_size: pageSize,
  });

  // Transform API data to GameCard props - memoized to prevent re-creation
  const currentGames: GameCardProps[] = useMemo(() => {
    return data?.results?.map((game: any) => ({
      id: game.id,
      name: game.name,
      backgroundImage: game.background_image,
      rating: game.rating,
      ratingsCount: game.ratings_count,
      released: game.released,
      platforms: game.platforms?.map((p: any) => p.platform?.name || p.platform) || [],
      genres: game.genres?.map((g: any) => g.name) || [],
      metacritic: game.metacritic,
      playtime: game.playtime,
    })) || [];
  }, [data?.results]);

  // Accumulated games for infinite scroll
  const [allGames, setAllGames] = useState<GameCardProps[]>([]);

  // Update accumulated games when page or data changes
  React.useEffect(() => {
    if (currentGames.length > 0) {
      if (page === 1) {
        // Reset games for new search
        setAllGames(currentGames);
      } else {
        // Append games for pagination (deduplicate by ID)
        setAllGames((prev) => {
          const existingIds = new Set(prev.map(g => g.id));
          const newGames = currentGames.filter(g => !existingIds.has(g.id));
          return [...prev, ...newGames];
        });
      }
    }
  }, [currentGames, page]); // Fixed: now depends on memoized currentGames and page

  // Reset to first page on search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setAllGames([]);
  }, []);

  // Load next page
  const handleLoadMore = useCallback(() => {
    if (!isLoading && data?.next) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, data?.next]);

  // Retry on error
  const handleRetry = useCallback(() => {
    setPage(1);
    setAllGames([]);
  }, []);

  const hasMore = !!data?.next;
  const errorMessage = error ? 'Failed to load games. Please try again.' : undefined;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Title */}
            <h1 className="mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              CONTINUUM
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Track your gaming journey. Discover your next adventure.
            </p>

            {/* Search Bar */}
            <GamingSearchBar
              onSearch={handleSearch}
              isLoading={isLoading && page === 1}
              className="mx-auto max-w-2xl"
            />

            {/* Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">850K+</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">10M+</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">50+</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_50%,oklch(0.75_0.15_195/0.1)_0%,transparent_100%)]" />
      </section>

      {/* Games Section */}
      <section className="container mx-auto px-4 py-12">
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Search Results for &quot;{searchQuery}&quot;
            </h2>
            <p className="text-muted-foreground">
              Found {data?.count?.toLocaleString() || 0} games
            </p>
          </div>
        )}

        <GameGrid
          games={allGames}
          isLoading={isLoading && page === 1}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          error={errorMessage}
          onRetry={handleRetry}
          emptyMessage={
            searchQuery
              ? `No games found for "${searchQuery}". Try a different search term.`
              : 'Start searching to discover games!'
          }
        />
      </section>
    </div>
  );
}
