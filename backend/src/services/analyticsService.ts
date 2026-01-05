import db from '../database/schema';
import { format, subDays, parseISO } from 'date-fns';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  teamId?: string;
  userId?: string;
  repositoryId?: string;
  dateRange?: DateRange;
}

// 获取概览统计
export function getOverviewStats(filters: FilterOptions) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND u.team_id = ?';
    params.push(filters.teamId);
  }

  if (filters.userId) {
    teamFilter += ' AND u.id = ?';
    params.push(filters.userId);
  }

  // 活跃用户数
  const activeUsers = db.prepare(`
    SELECT COUNT(DISTINCT s.user_id) as count
    FROM agent_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE DATE(s.started_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { count: number };

  // 总会话数
  const totalSessions = db.prepare(`
    SELECT COUNT(*) as count
    FROM agent_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE DATE(s.started_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { count: number };

  // AI代码占比
  const codeStats = db.prepare(`
    SELECT
      COALESCE(SUM(lines_added + lines_removed), 0) as total_lines,
      COALESCE(SUM(CASE WHEN is_ai_generated = 1 THEN lines_added + lines_removed ELSE 0 END), 0) as ai_lines
    FROM code_edits e
    JOIN users u ON e.user_id = u.id
    WHERE DATE(e.created_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { total_lines: number; ai_lines: number };

  // 编辑接受率
  const editAcceptance = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted
    FROM code_edits e
    JOIN users u ON e.user_id = u.id
    WHERE is_ai_generated = 1 AND DATE(e.created_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { total: number; accepted: number };

  // Tab补全统计
  const completionStats = db.prepare(`
    SELECT
      COALESCE(SUM(suggestions_count), 0) as total,
      COALESCE(SUM(accepted_count), 0) as accepted
    FROM tab_completions c
    JOIN users u ON c.user_id = u.id
    WHERE DATE(c.created_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { total: number; accepted: number };

  // PR统计
  const prStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'merged' THEN 1 ELSE 0 END) as merged,
      COALESCE(SUM(ai_lines_added), 0) as ai_lines
    FROM pull_requests p
    JOIN users u ON p.user_id = u.id
    WHERE DATE(p.created_at) BETWEEN ? AND ? ${teamFilter}
  `).get(...params) as { total: number; merged: number; ai_lines: number };

  // 消息统计（按模式和模型）
  const messagesByMode = db.prepare(`
    SELECT s.mode, COUNT(m.id) as count
    FROM messages m
    JOIN agent_sessions s ON m.session_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE DATE(m.created_at) BETWEEN ? AND ? ${teamFilter}
    GROUP BY s.mode
  `).all(...params) as { mode: string; count: number }[];

  const messagesByModel = db.prepare(`
    SELECT s.model, COUNT(m.id) as count
    FROM messages m
    JOIN agent_sessions s ON m.session_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE DATE(m.created_at) BETWEEN ? AND ? ${teamFilter}
    GROUP BY s.model
    ORDER BY count DESC
  `).all(...params) as { model: string; count: number }[];

  return {
    activeUsers: activeUsers.count,
    totalSessions: totalSessions.count,
    aiCodePercentage: codeStats.total_lines > 0
      ? Math.round((codeStats.ai_lines / codeStats.total_lines) * 100)
      : 0,
    editAcceptanceRate: editAcceptance.total > 0
      ? Math.round((editAcceptance.accepted / editAcceptance.total) * 100)
      : 0,
    tabCompletions: {
      total: completionStats.total,
      accepted: completionStats.accepted,
      rate: completionStats.total > 0
        ? Math.round((completionStats.accepted / completionStats.total) * 100)
        : 0
    },
    pullRequests: {
      opened: prStats.total,
      merged: prStats.merged,
      aiLinesAdded: prStats.ai_lines
    },
    messagesByMode,
    messagesByModel
  };
}

// 获取每日使用趋势
export function getDailyTrend(filters: FilterOptions) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND team_id = ?';
    params.push(filters.teamId);
  }

  const dailyStats = db.prepare(`
    SELECT
      date,
      SUM(active_users) as active_users,
      SUM(total_sessions) as sessions,
      SUM(total_messages) as messages,
      SUM(total_edits) as edits,
      SUM(ai_edits) as ai_edits,
      SUM(accepted_edits) as accepted_edits,
      SUM(prs_opened) as prs_opened,
      SUM(prs_merged) as prs_merged
    FROM daily_stats
    WHERE date BETWEEN ? AND ? ${teamFilter}
    GROUP BY date
    ORDER BY date ASC
  `).all(...params);

  return dailyStats;
}

// 获取用户排行榜
export function getUserLeaderboard(filters: FilterOptions, limit = 10) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND u.team_id = ?';
    params.push(filters.teamId);
  }

  params.push(limit);

  const leaderboard = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT s.id) as session_count,
      COUNT(DISTINCT DATE(s.started_at)) as active_days,
      (
        SELECT model
        FROM agent_sessions
        WHERE user_id = u.id
        GROUP BY model
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as favorite_model,
      (
        SELECT SUM(lines_added)
        FROM code_edits
        WHERE user_id = u.id AND is_ai_generated = 1 AND is_accepted = 1
          AND DATE(created_at) BETWEEN ? AND ?
      ) as ai_lines_accepted
    FROM users u
    LEFT JOIN agent_sessions s ON s.user_id = u.id AND DATE(s.started_at) BETWEEN ? AND ?
    WHERE 1=1 ${teamFilter}
    GROUP BY u.id
    ORDER BY session_count DESC
    LIMIT ?
  `).all(startDate, endDate, startDate, endDate, ...params.slice(2));

  return leaderboard;
}

// 获取仓库统计
export function getRepositoryStats(filters: FilterOptions) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate, startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND r.team_id = ?';
    params.push(filters.teamId);
  }

  const repoStats = db.prepare(`
    SELECT
      r.id,
      r.name,
      r.url,
      COUNT(DISTINCT e.id) as total_edits,
      COALESCE(SUM(e.lines_added), 0) as lines_added,
      COALESCE(SUM(CASE WHEN e.is_ai_generated = 1 THEN e.lines_added ELSE 0 END), 0) as ai_lines_added,
      (
        SELECT COUNT(*) FROM pull_requests WHERE repository_id = r.id AND DATE(created_at) BETWEEN ? AND ?
      ) as pr_count
    FROM repositories r
    LEFT JOIN code_edits e ON e.repository_id = r.id AND DATE(e.created_at) BETWEEN ? AND ?
    WHERE 1=1 ${teamFilter}
    GROUP BY r.id
    ORDER BY total_edits DESC
  `).all(...params);

  return repoStats.map((repo: any) => ({
    ...repo,
    aiPercentage: repo.lines_added > 0
      ? Math.round((repo.ai_lines_added / repo.lines_added) * 100)
      : 0
  }));
}

// 获取工作类型分布
export function getWorkCategoryDistribution(filters: FilterOptions) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND u.team_id = ?';
    params.push(filters.teamId);
  }

  const distribution = db.prepare(`
    SELECT
      work_category as category,
      COUNT(*) as count,
      SUM(lines_added) as lines_added,
      SUM(CASE WHEN is_ai_generated = 1 THEN lines_added ELSE 0 END) as ai_lines
    FROM code_edits e
    JOIN users u ON e.user_id = u.id
    WHERE work_category IS NOT NULL AND DATE(e.created_at) BETWEEN ? AND ? ${teamFilter}
    GROUP BY work_category
    ORDER BY count DESC
  `).all(...params);

  return distribution;
}

// 获取模型使用统计
export function getModelUsageStats(filters: FilterOptions) {
  const { startDate, endDate } = filters.dateRange || {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  };

  let teamFilter = '';
  const params: any[] = [startDate, endDate];

  if (filters.teamId) {
    teamFilter = 'AND u.team_id = ?';
    params.push(filters.teamId);
  }

  const modelStats = db.prepare(`
    SELECT
      s.model,
      COUNT(DISTINCT s.id) as session_count,
      COUNT(m.id) as message_count,
      COALESCE(SUM(m.tokens), 0) as total_tokens
    FROM agent_sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN messages m ON m.session_id = s.id
    WHERE DATE(s.started_at) BETWEEN ? AND ? ${teamFilter}
    GROUP BY s.model
    ORDER BY session_count DESC
  `).all(...params);

  return modelStats;
}

// 导出数据为CSV格式
export function exportToCSV(data: any[], filename: string): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// 获取团队列表
export function getTeams() {
  return db.prepare('SELECT * FROM teams ORDER BY name').all();
}

// 获取用户列表
export function getUsers(teamId?: string) {
  if (teamId) {
    return db.prepare('SELECT id, name, email, role FROM users WHERE team_id = ? ORDER BY name').all(teamId);
  }
  return db.prepare('SELECT id, name, email, role, team_id FROM users ORDER BY name').all();
}
