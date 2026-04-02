// Game tracking types
export type GameStatus = 'backlog' | 'playing' | 'completed' | 'dropped' | 'wishlist';

export interface TrackedGame {
  id: number;
  name: string;
  backgroundImage?: string;
  status: GameStatus;
  addedAt: string; // ISO date
  updatedAt: string; // ISO date
  
  // For completed games
  completedAt?: string;
  rating?: number; // 1-10
  hoursPlayed?: number;
  review?: string;
  
  // For playing games
  startedAt?: string;
  progress?: number; // 0-100
}

export interface GameLibrary {
  games: Record<number, TrackedGame>;
  stats: {
    totalGames: number;
    totalHours: number;
    completedGames: number;
    averageRating: number;
  };
}

// Storage keys
export const STORAGE_KEYS = {
  GAME_LIBRARY: 'continuum_game_library',
  USER_PREFERENCES: 'continuum_user_preferences',
} as const;

export const STORAGE_EVENTS = {
  LIBRARY_UPDATED: 'continuum:library-updated',
} as const;
