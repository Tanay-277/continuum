'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { rawgService } from '@/lib/api-service';
import { SearchBar } from '@/components/search-bar';
import { GameGrid } from '@/components/game-grid';
import type { GameCardProps } from '@/components/game-card';
import type { Game, RAWGGamesResponse } from '@/lib/types';
import { CATEGORY_CONFIGS, getCategoryConfig } from '@/lib/category-config';

const PLATFORM_OPTIONS = [
  { label: 'All Platforms', value: '' },
  { label: 'PC', value: '4' },
  { label: 'PlayStation', value: '18' },
  { label: 'Xbox', value: '1' },
  { label: 'Nintendo', value: '7' },
];

const SORT_OPTIONS = [
  { label: 'Top Rated', value: '-rating' },
  { label: 'Newest', value: '-released' },
  { label: 'Most Popular', value: '-added' },
  { label: 'Most Metacritic', value: '-metacritic' },
];

type RAWGPlatform = {
  platform?: {
    name?: string;
  };
};

type RAWGGenre = {
  name: string;
};

type RAWGGame = Game & {
  background_image?: string | null;
  rating?: number | null;
  ratings_count?: number | null;
  platforms?: RAWGPlatform[];
  genres?: RAWGGenre[];
  metacritic?: number | null;
  playtime?: number | null;
};

function mapGameToCardProps(game: RAWGGame): GameCardProps {
  const platforms =
    game.platforms?.map((entry) => {
      if (typeof entry.platform === 'string') {
        return entry.platform;
      }
      return entry.platform?.name || '';
    }).filter(Boolean) || [];

  return {
    id: game.id,
    name: game.name,
    backgroundImage: game.background_image ?? undefined,
    rating: game.rating ?? undefined,
    ratingsCount: game.ratings_count ?? undefined,
    released: game.released || undefined,
    platforms,
    genres: game.genres?.map((genre) => genre.name) || [],
    metacritic: game.metacritic ?? undefined,
    playtime: game.playtime ?? undefined,
  };
}

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params.slug || '').toLowerCase();
  const category = getCategoryConfig(slug);

  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState('');
  const [ordering, setOrdering] = useState('-rating');

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery<RAWGGamesResponse, Error>(
    {
      queryKey: ['category-games', slug, searchQuery, platform, ordering],
      queryFn: ({ pageParam = 1 }) =>
        rawgService.getGames({
          page: Number(pageParam),
          page_size: 24,
          search: searchQuery || undefined,
          platforms: platform || undefined,
          ordering,
          genres: category?.rawgGenre,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => (lastPage.next ? pages.length + 1 : undefined),
      enabled: !!category,
    }
  );

  const allGames = useMemo(() => {
    const merged =
      data?.pages.flatMap((resultPage) =>
        (resultPage.results as RAWGGame[] | undefined)?.map(mapGameToCardProps) || []
      ) || [];
    const seenIds = new Set<number>();

    return merged.filter((game) => {
      if (seenIds.has(game.id)) {
        return false;
      }

      seenIds.add(game.id);
      return true;
    });
  }, [data?.pages]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
  };

  const handleSortChange = (value: string) => {
    setOrdering(value);
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!category) {
    return (
      <div className="mx-auto w-full max-w-350 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="apple-surface rounded-3xl border border-white/10 p-8 text-center">
          <h1 className="apple-title text-3xl font-semibold">Category Not Found</h1>
          <p className="mt-2 text-muted-foreground">Choose one of the available categories below.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORY_CONFIGS.map((item) => (
              <Link
                key={item.slug}
                href={`/categories/${item.slug}`}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm hover:bg-white/15"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstPage = data?.pages[0];
  const hasMore = !!hasNextPage;
  const isGridLoading = (isLoading && allGames.length === 0) || isFetchingNextPage;
  const totalCount = firstPage?.count ?? allGames.length;
  const errorMessage = error ? 'Failed to load games. Please try again.' : undefined;

  return (
    <div className="mx-auto w-full max-w-350 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="apple-surface apple-card-shadow rounded-[32px] border border-white/10 p-8 sm:p-10">
        <Link
          href="/categories"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>

        <p className="apple-caption mb-2">Category</p>
        <h1 className="apple-title text-4xl font-semibold sm:text-5xl">{category.title}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{category.description}</p>
      </header>

      <section className="apple-surface mt-6 rounded-3xl border border-white/10 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <SearchBar
            onSearch={handleSearch}
            defaultValue={searchQuery}
            placeholder={`Search in ${category.title}...`}
            isLoading={isFetching && !isFetchingNextPage}
          />

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Platform</span>
            <select
              value={platform}
              onChange={(event) => handlePlatformChange(event.target.value)}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={ordering}
              onChange={(event) => handleSortChange(event.target.value)}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="apple-caption">Results</p>
            <h2 className="apple-title text-3xl font-semibold">
              {searchQuery ? `"${searchQuery}" in ${category.title}` : `${category.title} Games`}
            </h2>
          </div>

          <div className="apple-surface inline-flex w-fit rounded-2xl px-4 py-2 text-sm text-muted-foreground">
            {totalCount.toLocaleString()} titles
          </div>
        </div>

        <GameGrid
          games={allGames}
          isLoading={isGridLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          error={errorMessage}
          onRetry={handleRetry}
          emptyMessage="No games match these filters yet."
        />
      </section>
    </div>
  );
}
