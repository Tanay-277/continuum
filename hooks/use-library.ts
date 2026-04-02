import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type LibraryStatus = 'backlog' | 'playing' | 'completed' | 'dropped' | 'wishlist';

export interface LibraryItem {
  id: string;
  userId: string;
  gameId: number;
  name: string;
  backgroundImage?: string | null;
  status: LibraryStatus;
  rating?: number | null;
  hoursPlayed?: number | null;
  review?: string | null;
  progress?: number | null;
  addedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt: string;
}

export interface LibraryStats {
  totalGames: number;
  backlogGames: number;
  playingGames: number;
  completedGames: number;
  totalHours: number;
  averageRating: number;
}

export class LibraryApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'LibraryApiError';
    this.status = status;
  }
}

type UpsertPayload = {
  gameId: number;
  name: string;
  backgroundImage?: string | null;
  status: LibraryStatus;
  rating?: number | null;
  hoursPlayed?: number | null;
  review?: string | null;
  progress?: number | null;
};

type UpdatePayload = Partial<
  Pick<UpsertPayload, 'status' | 'rating' | 'hoursPlayed' | 'review' | 'progress'>
>;

type LibraryQueryOptions = {
  enabled?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    const message = (payload as { error?: string }).error || 'Request failed.';
    throw new LibraryApiError(message, response.status);
  }

  return payload;
}

async function fetchLibrary(status?: LibraryStatus): Promise<LibraryItem[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const response = await fetch(`/api/library${params.toString() ? `?${params.toString()}` : ''}`);
  const payload = await parseResponse<{ items: LibraryItem[] }>(response);
  return payload.items;
}

async function fetchLibraryStats(): Promise<LibraryStats> {
  const response = await fetch('/api/library/stats');
  return parseResponse<LibraryStats>(response);
}

async function upsertLibraryItem(payload: UpsertPayload): Promise<LibraryItem> {
  const response = await fetch('/api/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<{ item: LibraryItem }>(response);
  return data.item;
}

async function updateLibraryItem(gameId: number, payload: UpdatePayload): Promise<LibraryItem> {
  const response = await fetch(`/api/library/${gameId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<{ item: LibraryItem }>(response);
  return data.item;
}

async function deleteLibraryItem(gameId: number): Promise<void> {
  const response = await fetch(`/api/library/${gameId}`, {
    method: 'DELETE',
  });

  await parseResponse<{ ok: boolean }>(response);
}

export function useLibrary(status?: LibraryStatus, options?: LibraryQueryOptions) {
  return useQuery({
    queryKey: ['library', status || 'all'],
    queryFn: () => fetchLibrary(status),
    enabled: options?.enabled,
  });
}

export function useLibraryStats(options?: LibraryQueryOptions) {
  return useQuery({
    queryKey: ['library', 'stats'],
    queryFn: fetchLibraryStats,
    enabled: options?.enabled,
  });
}

export function useUpsertLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertLibraryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}

export function useUpdateLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, payload }: { gameId: number; payload: UpdatePayload }) =>
      updateLibraryItem(gameId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}

export function useDeleteLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: number) => deleteLibraryItem(gameId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
