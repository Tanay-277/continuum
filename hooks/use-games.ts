import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { rawgService, igdbService, twitchService } from "@/lib/api-service";
import type { RAWGGamesResponse, IGDBGamesResponse, Game } from "@/lib/types";

/**
 * Hook to fetch games from RAWG API
 */
export function useRAWGGames(
  params?: {
    page?: number;
    page_size?: number;
    search?: string;
    dates?: string;
    platforms?: string;
    genres?: string;
    ordering?: string;
  },
  options?: Omit<UseQueryOptions<RAWGGamesResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<RAWGGamesResponse, Error>({
    queryKey: ["rawg-games", params],
    queryFn: () => rawgService.getGames(params),
    ...options,
  });
}

/**
 * Hook to fetch a single game from RAWG API
 */
export function useRAWGGame(
  id: number,
  options?: Omit<UseQueryOptions<Game, Error>, "queryKey" | "queryFn">
) {
  return useQuery<Game, Error>({
    queryKey: ["rawg-game", id],
    queryFn: () => rawgService.getGameById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to search games from RAWG API
 */
export function useRAWGSearch(
  query: string,
  page = 1,
  options?: Omit<UseQueryOptions<RAWGGamesResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<RAWGGamesResponse, Error>({
    queryKey: ["rawg-search", query, page],
    queryFn: () => rawgService.searchGames(query, page),
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Hook to fetch games from IGDB API
 */
export function useIGDBGames(
  fields?: string,
  options?: Omit<UseQueryOptions<IGDBGamesResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<IGDBGamesResponse, Error>({
    queryKey: ["igdb-games", fields],
    queryFn: () => igdbService.getGames(fields),
    ...options,
  });
}

/**
 * Hook to search games from IGDB API
 */
export function useIGDBSearch(
  query: string,
  fields?: string,
  options?: Omit<UseQueryOptions<IGDBGamesResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<IGDBGamesResponse, Error>({
    queryKey: ["igdb-search", query, fields],
    queryFn: () => igdbService.searchGames(query, fields),
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Hook to get Twitch access token
 */
export function useTwitchAuth(
  options?: Omit<
    UseMutationOptions<{ access_token: string; expires_in: number }, Error>,
    "mutationFn"
  >
) {
  return useMutation<{ access_token: string; expires_in: number }, Error>({
    mutationFn: () => twitchService.getAccessToken(),
    ...options,
  });
}
