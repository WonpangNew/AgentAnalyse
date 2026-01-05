export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team_id?: string;
}

export interface OverviewStats {
  activeUsers: number;
  totalSessions: number;
  aiCodePercentage: number;
  editAcceptanceRate: number;
  tabCompletions: {
    total: number;
    accepted: number;
    rate: number;
  };
  pullRequests: {
    opened: number;
    merged: number;
    aiLinesAdded: number;
  };
  messagesByMode: { mode: string; count: number }[];
  messagesByModel: { model: string; count: number }[];
}

export interface DailyTrend {
  date: string;
  active_users: number;
  sessions: number;
  messages: number;
  edits: number;
  ai_edits: number;
  accepted_edits: number;
  prs_opened: number;
  prs_merged: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  session_count: number;
  active_days: number;
  favorite_model: string;
  ai_lines_accepted: number;
}

export interface RepositoryStats {
  id: string;
  name: string;
  url: string;
  total_edits: number;
  lines_added: number;
  ai_lines_added: number;
  aiPercentage: number;
  pr_count: number;
}

export interface WorkCategory {
  category: string;
  count: number;
  lines_added: number;
  ai_lines: number;
}

export interface ModelUsage {
  model: string;
  session_count: number;
  message_count: number;
  total_tokens: number;
}

export interface FilterOptions {
  teamId?: string;
  userId?: string;
  startDate: string;
  endDate: string;
}
