import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/analytics.db');

export const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'member',
      team_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 团队表
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 仓库表
  db.exec(`
    CREATE TABLE IF NOT EXISTS repositories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT,
      team_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Agent会话表
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      repository_id TEXT,
      model TEXT NOT NULL,
      mode TEXT NOT NULL,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (repository_id) REFERENCES repositories(id)
    )
  `);

  // 消息记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT,
      tokens INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES agent_sessions(id)
    )
  `);

  // 代码编辑记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS code_edits (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      repository_id TEXT,
      file_path TEXT NOT NULL,
      lines_added INTEGER DEFAULT 0,
      lines_removed INTEGER DEFAULT 0,
      is_ai_generated BOOLEAN DEFAULT 0,
      is_accepted BOOLEAN DEFAULT 0,
      edit_type TEXT,
      work_category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES agent_sessions(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (repository_id) REFERENCES repositories(id)
    )
  `);

  // Tab补全记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tab_completions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT,
      suggestions_count INTEGER DEFAULT 0,
      accepted_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (session_id) REFERENCES agent_sessions(id)
    )
  `);

  // PR记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS pull_requests (
      id TEXT PRIMARY KEY,
      repository_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_id TEXT,
      title TEXT,
      status TEXT DEFAULT 'open',
      lines_added INTEGER DEFAULT 0,
      lines_removed INTEGER DEFAULT 0,
      ai_lines_added INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      merged_at DATETIME,
      FOREIGN KEY (repository_id) REFERENCES repositories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (session_id) REFERENCES agent_sessions(id)
    )
  `);

  // 每日统计汇总表（用于快速查询）
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      team_id TEXT,
      active_users INTEGER DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      total_messages INTEGER DEFAULT 0,
      total_edits INTEGER DEFAULT 0,
      ai_edits INTEGER DEFAULT 0,
      accepted_edits INTEGER DEFAULT 0,
      total_completions INTEGER DEFAULT 0,
      accepted_completions INTEGER DEFAULT 0,
      prs_opened INTEGER DEFAULT 0,
      prs_merged INTEGER DEFAULT 0,
      UNIQUE(date, team_id)
    )
  `);

  // 创建索引以优化查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON agent_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON agent_sessions(started_at);
    CREATE INDEX IF NOT EXISTS idx_edits_user ON code_edits(user_id);
    CREATE INDEX IF NOT EXISTS idx_edits_date ON code_edits(created_at);
    CREATE INDEX IF NOT EXISTS idx_edits_repo ON code_edits(repository_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
  `);

  console.log('Database initialized successfully');
}

export default db;
