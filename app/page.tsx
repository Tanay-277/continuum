'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { useRAWGGames } from '@/hooks/use-games';
import { GameGrid } from '@/components/game-grid';
import { CommandSearchTrigger } from '@/components/search-bar';
import { SearchCommandPalette } from '@/components/search-command-palette';
import { GameCard, GameCardSkeleton, type GameCardProps } from '@/components/game-card';
import { CATEGORY_CONFIGS } from '@/lib/category-config';

type ShelfParams = {
  page_size?: number;
  ordering?: string;
  genres?: string;
};

const FEATURED_SECTION_ID = 'featured-grid';
const HOME_SHELL_CLASS = 'mx-auto w-full max-w-340 px-4 sm:px-6 lg:px-8';

const CATEGORY_SHELVES: Array<{
  id: string;
  title: string;
  subtitle: string;
  params: ShelfParams;
  categoryHref?: string;
}> = [
  {
    id: 'top-rated',
    title: 'Top Rated',
    subtitle: 'Highest community scores right now',
    params: { page_size: 12, ordering: '-rating' },
  },
  {
    id: 'new-releases',
    title: 'New Releases',
    subtitle: 'Fresh launches and newest drops',
    params: { page_size: 12, ordering: '-released' },
  },
  {
    id: 'action',
    title: 'Action Shelf',
    subtitle: 'Fast-paced combat and blockbuster thrills',
    params: { page_size: 12, genres: 'action', ordering: '-added' },
    categoryHref: '/categories/action',
  },
  {
    id: 'rpg',
    title: 'RPG Worlds',
    subtitle: 'Long-form adventures with deep progression',
    params: { page_size: 12, genres: 'role-playing-games-rpg', ordering: '-rating' },
    categoryHref: '/categories/rpg',
  },
];

function mapGameToCardProps(game: any): GameCardProps {
  return {
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
  };
}

function hasArtwork(game: GameCardProps): boolean {
  return typeof game.backgroundImage === 'string' && game.backgroundImage.length > 0;
}

function GameShelfRow({
  sectionId,
  title,
  subtitle,
  games,
  isLoading,
  categoryHref,
}: {
  sectionId: string;
  title: string;
  subtitle: string;
  games: GameCardProps[];
  isLoading?: boolean;
  categoryHref?: string;
}) {
  return (
    <section id={sectionId} className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="apple-title text-2xl font-semibold sm:text-3xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {categoryHref ? (
          <Link
            href={categoryHref}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/90 hover:bg-white/15"
          >
            Open Category
          </Link>
        ) : null}
      </div>

      <div className="thin-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={`shelf-skeleton-${index}`} className="w-84 shrink-0 snap-start">
                <GameCardSkeleton className="h-full" />
              </div>
            ))
          : games.map((game) => (
              <div key={game.id} className="w-84 shrink-0 snap-start">
                <GameCard {...game} className="h-full" />
              </div>
            ))}
      </div>
    </section>
  );
}

function FeaturedGridSection({
  games,
  isLoading,
}: {
  games: GameCardProps[];
  isLoading?: boolean;
}) {
  const featuredGames = games.slice(0, 8);

  return (
    <section id={FEATURED_SECTION_ID} className="scroll-mt-28 space-y-4">
      <div>
        <h3 className="apple-title text-2xl font-semibold sm:text-3xl">Featured</h3>
        <p className="mt-1 text-sm text-muted-foreground">Top highlights in a fixed two-row layout</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <GameCardSkeleton key={`featured-grid-skeleton-${index}`} className="h-full" />
            ))
          : featuredGames.map((game) => <GameCard key={game.id} {...game} className="h-full" />)}
      </div>
    </section>
  );
}

function CategoryShelfRow({
  id,
  title,
  subtitle,
  params,
  categoryHref,
}: {
  id: string;
  title: string;
  subtitle: string;
  params: ShelfParams;
  categoryHref?: string;
}) {
  const { data, isLoading } = useRAWGGames(params, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const shelfGames = useMemo(() => {
    return data?.results?.map(mapGameToCardProps).filter(hasArtwork) || [];
  }, [data?.results]);

  return (
    <GameShelfRow
      sectionId={id}
      title={title}
      subtitle={subtitle}
      games={shelfGames}
      isLoading={isLoading && shelfGames.length === 0}
      categoryHref={categoryHref}
    />
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [allGames, setAllGames] = useState<GameCardProps[]>([]);
  const pageSize = 20;
  const isSearching = searchQuery.length > 0;

  const { data: featuredData } = useRAWGGames(
    {
      page_size: 8,
      ordering: '-added',
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useRAWGGames(
    {
      search: isSearching ? searchQuery : undefined,
      page,
      page_size: pageSize,
      ordering: isSearching ? undefined : '-rating',
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const featuredGames: GameCardProps[] = useMemo(() => {
    return featuredData?.results?.map(mapGameToCardProps).filter(hasArtwork) || [];
  }, [featuredData?.results]);

  const currentGames: GameCardProps[] = useMemo(() => {
    return data?.results?.map(mapGameToCardProps).filter(hasArtwork) || [];
  }, [data?.results]);

  const commandGames: GameCardProps[] = useMemo(() => {
    const uniqueGames = new Map<number, GameCardProps>();
    [...featuredGames, ...allGames, ...currentGames].forEach((game) => {
      uniqueGames.set(game.id, game);
    });

    return Array.from(uniqueGames.values());
  }, [featuredGames, allGames, currentGames]);

  useEffect(() => {
    setActiveSlide(0);
  }, [featuredGames.length]);

  useEffect(() => {
    if (isCommandOpen || featuredGames.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % featuredGames.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [isCommandOpen, featuredGames.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (page === 1) {
      setAllGames(currentGames);
      return;
    }

    if (currentGames.length > 0) {
      setAllGames((previous) => {
        const existingIds = new Set(previous.map((game) => game.id));
        const newGames = currentGames.filter((game) => !existingIds.has(game.id));
        return [...previous, ...newGames];
      });
    }
  }, [currentGames, page]);

  const handleSearch = useCallback((query: string) => {
    const normalizedQuery = query.trim();
    setSearchQuery((previous) => (previous === normalizedQuery ? previous : normalizedQuery));
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && data?.next) {
      setPage((previous) => previous + 1);
    }
  }, [isFetching, data?.next]);

  const handleRetry = useCallback(() => {
    setPage(1);
    void refetch();
  }, [refetch]);

  const goToPrevSlide = useCallback(() => {
    if (featuredGames.length < 2) return;
    setActiveSlide((previous) =>
      previous === 0 ? featuredGames.length - 1 : previous - 1
    );
  }, [featuredGames.length]);

  const goToNextSlide = useCallback(() => {
    if (featuredGames.length < 2) return;
    setActiveSlide((previous) => (previous + 1) % featuredGames.length);
  }, [featuredGames.length]);

  const activeFeaturedGame = featuredGames[activeSlide] ?? featuredGames[0];
  const isSearchLoading = isSearching && isFetching && page === 1;
  const isGridLoading = (isLoading && allGames.length === 0) || (isFetching && page > 1);
  const hasMore = !!data?.next;
  const totalCount = data?.count ?? allGames.length;
  const errorMessage = error ? 'Failed to load games. Please try again.' : undefined;

  const sectionLinks = [
    { href: `#${FEATURED_SECTION_ID}`, label: 'Featured' },
    ...CATEGORY_SHELVES.map((shelf) => ({ href: `#${shelf.id}`, label: shelf.title })),
  ];

  return (
    <div className="pb-16">
      <section className={`${HOME_SHELL_CLASS} pt-4`}>
        <div className="apple-surface apple-card-shadow relative w-full overflow-hidden rounded-[34px] border border-white/15">
          {activeFeaturedGame?.backgroundImage && (
            <Image
              key={activeFeaturedGame.id}
              src={activeFeaturedGame.backgroundImage}
              alt={activeFeaturedGame.name}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          )}

          <div className="absolute inset-0 bg-linear-to-b from-sky-500/8 via-sky-900/28 to-sky-950/88" />
          <div className="absolute inset-0 bg-linear-to-r from-black/76 via-black/48 to-black/34" />

          {featuredGames.length > 1 && (
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              <button
                type="button"
                onClick={goToPrevSlide}
                className="h-9 w-9 rounded-full border border-white/30 bg-black/30 text-white transition hover:bg-black/45"
                aria-label="Previous featured game"
              >
                <ChevronLeft className="mx-auto h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextSlide}
                className="h-9 w-9 rounded-full border border-white/30 bg-black/30 text-white transition hover:bg-black/45"
                aria-label="Next featured game"
              >
                <ChevronRight className="mx-auto h-4 w-4" />
              </button>
            </div>
          )}

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
            <p className="apple-caption mb-3 flex items-center gap-2 text-white/85">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Carousel
            </p>
            <h1 className="apple-title max-w-3xl text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              {activeFeaturedGame?.name || 'Discover your next masterpiece'}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/78 sm:text-lg">
              Browse premium game picks, then use sections below to move quickly across categories.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {activeFeaturedGame ? (
                <Link
                  href={`/games/${activeFeaturedGame.id}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Open Featured
                </Link>
              ) : (
                <span className="inline-flex h-11 items-center rounded-full bg-white/90 px-5 text-sm font-semibold text-black">
                  Loading Featured
                </span>
              )}

              <a
                href="#catalogue"
                className="inline-flex h-11 items-center gap-1 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Browse Catalog
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {featuredGames.length > 1 && (
              <div className="mt-5 flex items-center gap-2">
                {featuredGames.map((featuredGame, index) => (
                  <button
                    key={featuredGame.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={
                      index === activeSlide
                        ? 'h-2.5 w-7 rounded-full bg-white'
                        : 'h-2.5 w-2.5 rounded-full bg-white/45 hover:bg-white/70'
                    }
                    aria-label={`Go to featured game ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={`${HOME_SHELL_CLASS} mt-6`}>
        <div className="apple-surface apple-card-shadow rounded-3xl border border-white/10 p-4 sm:p-5">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="apple-caption">Search Hub</p>
              <h2 className="text-2xl font-semibold tracking-tight">Find Games Faster</h2>
            </div>
            <Link
              href="/categories"
              className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/90 hover:bg-white/15 sm:inline-flex"
            >
              All Categories
            </Link>
          </div>

          <CommandSearchTrigger
            onOpen={() => setIsCommandOpen(true)}
            isLoading={isSearchLoading}
            className="w-full"
          />

          <div className="thin-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_CONFIGS.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-foreground/90 hover:bg-white/15"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${HOME_SHELL_CLASS} mt-6`}>
        <div className="thin-scrollbar flex gap-2 overflow-x-auto pb-1">
          {sectionLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground hover:bg-white/15 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/categories"
            className="shrink-0 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground hover:bg-white/15 hover:text-foreground"
          >
            Categories Page
          </Link>
        </div>
      </section>

      <section id="catalogue" className={`${HOME_SHELL_CLASS} mt-10`}>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="apple-caption">Section Browser</p>
            <h2 className="apple-title text-3xl font-semibold sm:text-4xl">
              {isSearching ? 'Search Results' : 'Browse By Category'}
            </h2>
            {isSearching && <p className="mt-1 text-sm text-muted-foreground">Query: &quot;{searchQuery}&quot;</p>}
          </div>

          <div className="flex items-center gap-2">
            <div className="apple-surface inline-flex w-fit rounded-2xl px-4 py-2 text-sm text-muted-foreground">
              {totalCount.toLocaleString()} titles available
            </div>
            {isSearching ? (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-foreground/90 hover:bg-white/15"
              >
                Clear Search
              </button>
            ) : null}
          </div>
        </div>

        {isSearching ? (
          <GameGrid
            games={allGames}
            isLoading={isGridLoading}
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
        ) : (
          <div className="space-y-10">
            <FeaturedGridSection
              games={allGames}
              isLoading={isGridLoading}
            />

            {CATEGORY_SHELVES.map((shelf) => (
              <CategoryShelfRow
                id={shelf.id}
                key={shelf.id}
                title={shelf.title}
                subtitle={shelf.subtitle}
                params={shelf.params}
                categoryHref={shelf.categoryHref}
              />
            ))}
          </div>
        )}
      </section>

      <SearchCommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        games={commandGames}
        onSearch={handleSearch}
      />
    </div>
  );
}
