'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
}

interface CommandSearchTriggerProps {
  onOpen: () => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search games...',
  defaultValue = '',
  debounceMs = 500,
  isLoading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
    }
  }, [handleClear]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Icon */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Input */}
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'h-12 pl-11 pr-12 text-base',
          'bg-background/50 backdrop-blur-sm',
          'border-border/50 focus:border-primary/50',
          'transition-all duration-300',
          'focus-visible:ring-primary/30 focus-visible:ring-offset-0',
          'placeholder:text-muted-foreground/60'
        )}
      />

      {/* Clear Button */}
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

// Gaming-themed search bar with neon effects
export function GamingSearchBar({
  onSearch,
  placeholder = '🎮 Search your next adventure...',
  defaultValue = '',
  debounceMs = 500,
  isLoading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
    }
  }, [handleClear]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Focus halo for cinematic search affordance */}
      {isFocused && (
        <div className="absolute -inset-1 rounded-[1.35rem] bg-linear-to-r from-primary/25 via-primary/10 to-accent/25 blur-md" />
      )}

      <div className="relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Search className={cn(
              'h-5 w-5 transition-colors',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )} />
          )}
        </div>

        {/* Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-14 rounded-2xl pl-12 pr-12 text-[15px] font-medium sm:text-base',
            'glass-effect apple-card-shadow border-white/10',
            'transition-all duration-300',
            'focus-visible:border-primary/55 focus-visible:ring-0 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground/75',
            isFocused && 'apple-focus-ring'
          )}
        />

        {/* Clear Button */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={cn(
              'absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2',
              'text-muted-foreground hover:text-primary hover:bg-primary/10',
              'transition-colors'
            )}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Search hint */}
      {isFocused && !query && (
        <div className="absolute left-4 top-full mt-2 flex items-center gap-2 text-xs text-muted-foreground/90">
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
          <span>to clear</span>
        </div>
      )}
    </div>
  );
}

export function CommandSearchTrigger({
  onOpen,
  placeholder = 'Search games, genres, platforms...',
  isLoading = false,
  className,
}: CommandSearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'glass-effect apple-card-shadow flex h-14 w-full items-center rounded-2xl border border-white/10 px-4 text-left transition-all duration-300 hover:border-primary/40',
        className
      )}
      aria-label="Open search command palette"
    >
      <span className="mr-3 text-muted-foreground">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
      </span>
      <span className="flex-1 text-sm text-muted-foreground/85 sm:text-base">{placeholder}</span>
      <span className="ml-3 hidden items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-muted-foreground md:inline-flex">
        Cmd/Ctrl
        <span className="font-semibold text-foreground">K</span>
      </span>
    </button>
  );
}
