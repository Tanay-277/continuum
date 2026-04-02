import { apiClient, rawgClient } from "./axios";
import type { RAWGGamesResponse, IGDBGamesResponse } from "./types";

/**
 * RAWG API Service
 * All RAWG API related calls go through the Next.js API route
 */
export const rawgService = {
  /**
   * Fetch games from RAWG API
   */
  getGames: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    dates?: string;
    platforms?: string;
    genres?: string;
    ordering?: string;
  }): Promise<RAWGGamesResponse> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `games?${queryString}` : "games";

    // const endpoint = queryParams.toString() 
    //   ? `games?${queryParams.toString()}` 
    //   : "games";

    const response = await rawgClient.get<RAWGGamesResponse>(
      `/${endpoint}`
    );
    console.log("Resp", response);

    return response.data;
  },

  /**
   * Fetch a single game by ID
   */
  getGameById: async (id: number): Promise<any> => {
    const response = await rawgClient.get(`/games/${id}`);
    return response.data;
  },

  /**
   * Search games by query
   */
  searchGames: async (query: string, page = 1): Promise<RAWGGamesResponse> => {
    return rawgService.getGames({ search: query, page });
  },
};

/**
 * IGDB API Service
 * All IGDB API related calls go through the Next.js API route
 */
export const igdbService = {
  /**
   * Fetch games from IGDB API
   */
  getGames: async (fields?: string): Promise<IGDBGamesResponse> => {
    const response = await apiClient.post<IGDBGamesResponse>("/igdb", {
      fields: fields || "name,rating,summary,cover.url,release_dates.human",
    });
    return response.data;
  },

  /**
   * Search games in IGDB
   */
  searchGames: async (
    query: string,
    fields?: string
  ): Promise<IGDBGamesResponse> => {
    const response = await apiClient.post<IGDBGamesResponse>("/igdb", {
      fields: fields || "name,rating,summary,cover.url",
      search: query,
    });
    return response.data;
  },
};

/**
 * Twitch Authentication Service
 */
export const twitchService = {
  /**
   * Get Twitch OAuth token for IGDB access
   */
  getAccessToken: async (): Promise<{ access_token: string; expires_in: number }> => {
    const response = await apiClient.post<{ access_token: string; expires_in: number }>(
      "/twitch-auth"
    );
    return response.data;
  },
};
