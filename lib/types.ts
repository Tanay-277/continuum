// Type definitions for API responses

export interface Game {
  id: number;
  name: string;
  slug: string;
  released: string;
  rating: number;
  ratings_count?: number;
  metacritic?: number;
  playtime?: number;
  background_image?: string;
  platforms?: Platform[];
  genres?: Genre[];
  esrb_rating?: ESRBRating;
  developers?: Array<{ id?: number | string; name: string }>;
  publishers?: Array<{ id?: number | string; name: string }>;
  tags?: Array<{ id?: number | string; name: string }>;
  stores?: Array<{ store?: { name?: string } }>;
  ratings?: Array<{ title?: string; count?: number; percent?: number }>;
  description_raw?: string;
  short_screenshots?: Array<{ id?: number | string; image: string }>;
  website?: string;
  reddit_url?: string;
  metacritic_url?: string;
}

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface ESRBRating {
  id: number;
  name: string;
  slug: string;
}

export interface RAWGGamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}

export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  rating?: number;
  cover?: {
    id: number;
    url: string;
  };
  release_dates?: Array<{
    id: number;
    human: string;
  }>;
}

export interface IGDBGamesResponse {
  games: IGDBGame[];
}

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}
