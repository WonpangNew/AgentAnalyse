import type {
  OverviewStats,
  DailyTrend,
  LeaderboardUser,
  RepositoryStats,
  WorkCategory,
  ModelUsage,
  Team,
  User,
  FilterOptions,
} from '../types';

const API_BASE = '/api/analytics';

function buildQueryString(filters: Partial<FilterOptions>): string {
  const params = new URLSearchParams();
  if (filters.teamId) params.append('teamId', filters.teamId);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  return params.toString();
}

async function fetchAPI<T>(endpoint: string, filters?: Partial<FilterOptions>): Promise<T> {
  const queryString = filters ? buildQueryString(filters) : '';
  const url = `${API_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getOverviewStats(filters?: Partial<FilterOptions>): Promise<OverviewStats> {
  return fetchAPI<OverviewStats>('/overview', filters);
}

export async function getDailyTrend(filters?: Partial<FilterOptions>): Promise<DailyTrend[]> {
  return fetchAPI<DailyTrend[]>('/daily-trend', filters);
}

export async function getLeaderboard(filters?: Partial<FilterOptions>, limit = 10): Promise<LeaderboardUser[]> {
  const queryString = buildQueryString(filters || {});
  const separator = queryString ? '&' : '?';
  const url = `${API_BASE}/leaderboard${queryString ? `?${queryString}` : ''}${separator}limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getRepositoryStats(filters?: Partial<FilterOptions>): Promise<RepositoryStats[]> {
  return fetchAPI<RepositoryStats[]>('/repositories', filters);
}

export async function getWorkCategories(filters?: Partial<FilterOptions>): Promise<WorkCategory[]> {
  return fetchAPI<WorkCategory[]>('/work-categories', filters);
}

export async function getModelUsage(filters?: Partial<FilterOptions>): Promise<ModelUsage[]> {
  return fetchAPI<ModelUsage[]>('/model-usage', filters);
}

export async function getTeams(): Promise<Team[]> {
  return fetchAPI<Team[]>('/teams');
}

export async function getUsers(teamId?: string): Promise<User[]> {
  const url = teamId ? `${API_BASE}/users?teamId=${teamId}` : `${API_BASE}/users`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function getExportUrl(type: string, filters?: Partial<FilterOptions>): string {
  const queryString = filters ? buildQueryString(filters) : '';
  return `${API_BASE}/export/${type}${queryString ? `?${queryString}` : ''}`;
}
