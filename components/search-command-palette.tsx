'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Filter, Gamepad2, Home, ListChecks, Search, Star, Trophy, User, X } from 'lucide-react';
import { useRAWGGames } from '@/hooks/use-games';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { GameCardProps } from '@/components/game-card';
import type { Game } from '@/lib/types';

interface SearchCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  games: GameCardProps[];
  onSearch: (query: string) => void;
}

type FilterOption = {
  label: string;
  value: string;
  count: number;
};

const NAV_ACTIONS = [
  { label: 'Discover', href: '/', icon: Home, shortcut: 'G D' },
  { label: 'Backlog', href: '/backlog', icon: ListChecks, shortcut: 'G B' },
  { label: 'Completed', href: '/completed', icon: Trophy, shortcut: 'G C' },
  { label: 'Profile', href: '/profile', icon: User, shortcut: 'G P' },
];

type RawgSearchGame = Game & {
  ratings_count?: number;
  metacritic?: number | null;
  playtime?: number | null;
};

function mapRawgGameToCard(game: RawgSearchGame): GameCardProps {
  const platforms: string[] = [];
  const genres: string[] = [];

  game.platforms?.forEach((platformEntry) => {
    if (platformEntry.platform?.name) {
      platforms.push(platformEntry.platform.name);
    }
  });

  game.genres?.forEach((genre) => {
    if (genre.name) {
      genres.push(genre.name);
    }
  });

  return {
    id: game.id,
    name: game.name,
    backgroundImage: game.background_image || undefined,
    rating: game.rating || undefined,
    ratingsCount: game.ratings_count,
    released: game.released || undefined,
    platforms,
    genres,
    metacritic: game.metacritic ?? undefined,
    playtime: game.playtime ?? undefined,
  };
}

function toSearchableText(game: GameCardProps): string {
  return [game.name, game.genres?.join(' '), game.platforms?.join(' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function toSubtitle(game: GameCardProps): string {
  const parts: string[] = [];

  if (game.genres && game.genres.length > 0) {
    parts.push(game.genres.slice(0, 2).join(' • '));
  }

  if (game.platforms && game.platforms.length > 0) {
    parts.push(game.platforms.slice(0, 2).join(' • '));
  }

  if (parts.length === 0) {
    return 'Open details page';
  }

  return parts.join('  |  ');
}

function buildFilterOptions(values: string[]): FilterOption[] {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      label: value
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 px-1 pb-2 xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`search-skeleton-${index}`}
          className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-3"
        >
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-white/8" />

          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded bg-white/7" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/7" />
            <div className="mt-1 flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-white/8" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-white/8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchCommandPalette({
  open,
  onOpenChange,
  games,
  onSearch,
}: SearchCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const normalizedQuery = query.trim();

  const { data: remoteSearchData, isFetching: isRemoteSearching } = useRAWGGames(
    {
      page: 1,
      page_size: 40,
      search: normalizedQuery || undefined,
      ordering: '-rating',
    },
    {
      enabled: open && normalizedQuery.length >= 2,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const remoteSearchGames = useMemo(() => {
    return (
      remoteSearchData?.results
        ?.map((game) => mapRawgGameToCard(game as RawgSearchGame))
        .filter((game) => Boolean(game.backgroundImage)) || []
    );
  }, [remoteSearchData?.results]);

  const genreOptions = useMemo(() => {
    const allGenres = games.flatMap((game) => game.genres || []);
    return buildFilterOptions(allGenres);
  }, [games]);

  const platformOptions = useMemo(() => {
    const allPlatforms = games.flatMap((game) => game.platforms || []);
    return buildFilterOptions(allPlatforms);
  }, [games]);

  const filteredGames = useMemo(() => {
    const sourceGames =
      normalizedQuery.length >= 2
        ? (remoteSearchGames.length > 0 ? remoteSearchGames : games)
        : games;

    const rankedGames = [...sourceGames].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const genreScoped = rankedGames.filter((game) => {
      if (genreFilter === 'all') return true;
      return (game.genres || []).some((genre) => genre.toLowerCase() === genreFilter);
    });

    const platformScoped = genreScoped.filter((game) => {
      if (platformFilter === 'all') return true;
      return (game.platforms || []).some((platform) => platform.toLowerCase() === platformFilter);
    });

    if (!normalizedQuery) {
      return platformScoped.slice(0, 12);
    }

    const searchTerm = normalizedQuery.toLowerCase();
    return platformScoped
      .filter((game) => toSearchableText(game).includes(searchTerm))
      .slice(0, 16);
  }, [games, remoteSearchGames, genreFilter, platformFilter, normalizedQuery]);

  const activeFilterCount = (genreFilter === 'all' ? 0 : 1) + (platformFilter === 'all' ? 0 : 1);

  const resetFilters = () => {
    setGenreFilter('all');
    setPlatformFilter('all');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery('');
      resetFilters();
    }
    onOpenChange(nextOpen);
  };

  const runSearch = () => {
    if (!normalizedQuery) return;

    onSearch(normalizedQuery);
    onOpenChange(false);
  };

  const openGame = (gameId: number) => {
    onOpenChange(false);
    router.push(`/games/${gameId}`);
  };

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Search Games"
      description="Search games and jump to app sections"
      className="w-[min(80vw,84rem)] max-w-none! border border-white/10 bg-background/95 p-0 backdrop-blur-xl"
      showCloseButton={false}
    >
      <Command shouldFilter={false} className="bg-transparent p-0">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search games, genres, platforms..."
        />

        <div className="border-border/60 border-b px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <div className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setGenreFilter('all')}
              className={
                genreFilter === 'all'
                  ? 'shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-foreground'
                  : 'shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
              }
            >
              All Genres
            </button>
            {genreOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGenreFilter(option.value)}
                className={
                  genreFilter === option.value
                    ? 'shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-foreground'
                    : 'shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="thin-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={
                platformFilter === 'all'
                  ? 'shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-foreground'
                  : 'shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
              }
            >
              All Platforms
            </button>
            {platformOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlatformFilter(option.value)}
                className={
                  platformFilter === option.value
                    ? 'shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-foreground'
                    : 'shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <CommandList data-lenis-prevent className="max-h-[min(62vh,520px)] pb-2">
          <CommandEmpty>
            {normalizedQuery
              ? 'No matching games yet. Press Enter to search this term.'
              : 'Type to search games or jump to a section.'}
          </CommandEmpty>

          {normalizedQuery && (
            <>
              <CommandGroup heading="Search">
                <CommandItem onSelect={runSearch}>
                  <Search className="h-4 w-4" />
                  <span>Search for &quot;{normalizedQuery}&quot;</span>
                  <span className="ml-auto text-xs tracking-widest text-muted-foreground">Enter</span>
                </CommandItem>
                {isRemoteSearching ? (
                  <div className="px-3 pb-2 text-xs text-muted-foreground">Searching full RAWG catalog...</div>
                ) : null}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading={normalizedQuery ? 'Matching Games' : 'Popular Games'}>
            {isRemoteSearching && normalizedQuery.length >= 2 ? (
              <SearchResultsSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-2 px-1 pb-2 xl:grid-cols-2">
                {filteredGames.map((game) => (
                  <CommandItem
                    key={game.id}
                    onSelect={() => openGame(game.id)}
                    className="items-start gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-3 transition-colors hover:bg-white/7 data-selected:bg-white/9"
                  >
                    {game.backgroundImage ? (
                      <Image
                        src={game.backgroundImage}
                        alt={game.name}
                        width={72}
                        height={72}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Gamepad2 className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-1 text-[0.97rem] font-semibold">{game.name}</span>
                      <span className="line-clamp-2 text-xs leading-4 text-muted-foreground/90">{toSubtitle(game)}</span>

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {typeof game.rating === 'number' && game.rating > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/4 px-2 py-0.5">
                            <Star className="h-3.5 w-3.5 text-amber-300" />
                            {game.rating.toFixed(1)}
                          </span>
                        )}
                        {game.released && (
                          <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5">
                            {new Date(game.released).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </div>
            )}
          </CommandGroup>
        </CommandList>

        <div className="border-border/60 border-t px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">Navigate</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {NAV_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => navigate(action.href)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-left transition hover:bg-white/8"
                >
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </span>
                  <span className="text-[10px] tracking-wide text-muted-foreground">{action.shortcut}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}
