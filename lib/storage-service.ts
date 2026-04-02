import { TrackedGame, GameLibrary, GameStatus, STORAGE_EVENTS, STORAGE_KEYS } from './storage-types';

/**
 * localStorage Service for Game Tracking
 * Designed to be easily swappable with Supabase later
 */
class StorageService {
  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Get game library from storage
  private getLibrary(): GameLibrary {
    if (!this.isBrowser()) {
      return this.getEmptyLibrary();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_LIBRARY);
      if (!stored) return this.getEmptyLibrary();

      const parsed = JSON.parse(stored) as Partial<GameLibrary>;
      const games = parsed.games || {};

      return {
        games,
        stats: this.calculateStats(games),
      };
    } catch (error) {
      console.error('Failed to read game library:', error);
      return this.getEmptyLibrary();
    }
  }

  private emitLibraryUpdated(): void {
    if (!this.isBrowser()) return;
    window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.LIBRARY_UPDATED));
  }

  // Save game library to storage
  private saveLibrary(library: GameLibrary): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(STORAGE_KEYS.GAME_LIBRARY, JSON.stringify(library));
      this.emitLibraryUpdated();
    } catch (error) {
      console.error('Failed to save game library:', error);
    }
  }

  // Get empty library structure
  private getEmptyLibrary(): GameLibrary {
    return {
      games: {},
      stats: {
        totalGames: 0,
        totalHours: 0,
        completedGames: 0,
        averageRating: 0,
      },
    };
  }

  // Calculate stats from games
  private calculateStats(games: Record<number, TrackedGame>): GameLibrary['stats'] {
    const gamesArray = Object.values(games);
    const completedGames = gamesArray.filter(g => g.status === 'completed');
    
    const totalHours = completedGames.reduce((sum, game) => {
      return sum + (game.hoursPlayed || 0);
    }, 0);

    const ratedGames = completedGames.filter(g => g.rating);
    const averageRating = ratedGames.length > 0
      ? ratedGames.reduce((sum, game) => sum + (game.rating || 0), 0) / ratedGames.length
      : 0;

    return {
      totalGames: gamesArray.length,
      totalHours,
      completedGames: completedGames.length,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Add or update a game in the library
   */
  addGame(
    gameId: number,
    gameName: string,
    status: GameStatus,
    backgroundImage?: string
  ): TrackedGame {
    const library = this.getLibrary();
    const now = new Date().toISOString();
    
    const existingGame = library.games[gameId];
    const game: TrackedGame = {
      ...existingGame,
      id: gameId,
      name: gameName,
      backgroundImage: backgroundImage ?? existingGame?.backgroundImage,
      status,
      addedAt: existingGame?.addedAt || now,
      updatedAt: now,
    };

    // Set startedAt if moving to playing
    if (status === 'playing' && !game.startedAt) {
      game.startedAt = now;
    }

    // Set completedAt if moving to completed
    if (status === 'completed' && !game.completedAt) {
      game.completedAt = now;
    }

    library.games[gameId] = game;
    library.stats = this.calculateStats(library.games);
    
    this.saveLibrary(library);
    return game;
  }

  /**
   * Remove a game from the library
   */
  removeGame(gameId: number): void {
    const library = this.getLibrary();
    delete library.games[gameId];
    library.stats = this.calculateStats(library.games);
    this.saveLibrary(library);
  }

  /**
   * Update game details (rating, hours, review, etc.)
   */
  updateGame(gameId: number, updates: Partial<TrackedGame>): TrackedGame | null {
    const library = this.getLibrary();
    const game = library.games[gameId];
    
    if (!game) return null;

    const updatedGame: TrackedGame = {
      ...game,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    library.games[gameId] = updatedGame;
    library.stats = this.calculateStats(library.games);
    
    this.saveLibrary(library);
    return updatedGame;
  }

  /**
   * Get a single game by ID
   */
  getGame(gameId: number): TrackedGame | null {
    const library = this.getLibrary();
    return library.games[gameId] || null;
  }

  /**
   * Get all games with a specific status
   */
  getGamesByStatus(status: GameStatus): TrackedGame[] {
    const library = this.getLibrary();
    return Object.values(library.games)
      .filter(game => game.status === status)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get all games
   */
  getAllGames(): TrackedGame[] {
    const library = this.getLibrary();
    return Object.values(library.games)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get library stats
   */
  getStats(): GameLibrary['stats'] {
    const library = this.getLibrary();
    return library.stats;
  }

  /**
   * Check if a game is tracked
   */
  isGameTracked(gameId: number): boolean {
    const library = this.getLibrary();
    return gameId in library.games;
  }

  /**
   * Get game status
   */
  getGameStatus(gameId: number): GameStatus | null {
    const game = this.getGame(gameId);
    return game?.status || null;
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAll(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.GAME_LIBRARY);
    this.emitLibraryUpdated();
  }

  /**
   * Export data (for backup or migration)
   */
  exportData(): GameLibrary {
    return this.getLibrary();
  }

  /**
   * Import data (for restore or migration)
   */
  importData(data: GameLibrary): void {
    this.saveLibrary(data);
  }
}

// Export singleton instance
export const storageService = new StorageService();
