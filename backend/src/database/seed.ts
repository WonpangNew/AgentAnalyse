import { db, initializeDatabase } from './schema';
import { v4 as uuidv4 } from 'uuid';
import { subDays, format, addHours } from 'date-fns';
import fs from 'fs';
import path from 'path';

// 确保data目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

initializeDatabase();

// 清空现有数据
db.exec('DELETE FROM daily_stats');
db.exec('DELETE FROM pull_requests');
db.exec('DELETE FROM tab_completions');
db.exec('DELETE FROM code_edits');
db.exec('DELETE FROM messages');
db.exec('DELETE FROM agent_sessions');
db.exec('DELETE FROM repositories');
db.exec('DELETE FROM users');
db.exec('DELETE FROM teams');

// 创建团队
const teams = [
  { id: uuidv4(), name: 'Frontend Team' },
  { id: uuidv4(), name: 'Backend Team' },
  { id: uuidv4(), name: 'DevOps Team' },
];

const insertTeam = db.prepare('INSERT INTO teams (id, name) VALUES (?, ?)');
teams.forEach(team => insertTeam.run(team.id, team.name));

// 创建用户
const users = [
  { id: uuidv4(), name: 'Alice Chen', email: 'alice@example.com', role: 'admin', team_id: teams[0].id },
  { id: uuidv4(), name: 'Bob Wang', email: 'bob@example.com', role: 'member', team_id: teams[0].id },
  { id: uuidv4(), name: 'Carol Liu', email: 'carol@example.com', role: 'member', team_id: teams[0].id },
  { id: uuidv4(), name: 'David Zhang', email: 'david@example.com', role: 'member', team_id: teams[1].id },
  { id: uuidv4(), name: 'Eva Li', email: 'eva@example.com', role: 'member', team_id: teams[1].id },
  { id: uuidv4(), name: 'Frank Wu', email: 'frank@example.com', role: 'member', team_id: teams[1].id },
  { id: uuidv4(), name: 'Grace Zhao', email: 'grace@example.com', role: 'member', team_id: teams[2].id },
  { id: uuidv4(), name: 'Henry Sun', email: 'henry@example.com', role: 'member', team_id: teams[2].id },
];

const insertUser = db.prepare('INSERT INTO users (id, name, email, role, team_id) VALUES (?, ?, ?, ?, ?)');
users.forEach(user => insertUser.run(user.id, user.name, user.email, user.role, user.team_id));

// 创建仓库
const repositories = [
  { id: uuidv4(), name: 'web-app', url: 'https://github.com/company/web-app', team_id: teams[0].id },
  { id: uuidv4(), name: 'mobile-app', url: 'https://github.com/company/mobile-app', team_id: teams[0].id },
  { id: uuidv4(), name: 'api-server', url: 'https://github.com/company/api-server', team_id: teams[1].id },
  { id: uuidv4(), name: 'data-pipeline', url: 'https://github.com/company/data-pipeline', team_id: teams[1].id },
  { id: uuidv4(), name: 'infrastructure', url: 'https://github.com/company/infrastructure', team_id: teams[2].id },
];

const insertRepo = db.prepare('INSERT INTO repositories (id, name, url, team_id) VALUES (?, ?, ?, ?)');
repositories.forEach(repo => insertRepo.run(repo.id, repo.name, repo.url, repo.team_id));

// 模型列表
const models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'gpt-4', 'gpt-4-turbo'];
const modes = ['chat', 'agent', 'composer'];
const workCategories = ['bug_fix', 'new_feature', 'refactoring', 'documentation', 'testing', 'optimization'];
const editTypes = ['insert', 'modify', 'delete'];

// 生成过去90天的数据
const insertSession = db.prepare(`
  INSERT INTO agent_sessions (id, user_id, repository_id, model, mode, started_at, ended_at, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMessage = db.prepare(`
  INSERT INTO messages (id, session_id, role, content, tokens, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertEdit = db.prepare(`
  INSERT INTO code_edits (id, session_id, user_id, repository_id, file_path, lines_added, lines_removed, is_ai_generated, is_accepted, edit_type, work_category, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCompletion = db.prepare(`
  INSERT INTO tab_completions (id, user_id, session_id, suggestions_count, accepted_count, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPR = db.prepare(`
  INSERT INTO pull_requests (id, repository_id, user_id, session_id, title, status, lines_added, lines_removed, ai_lines_added, created_at, merged_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Generating sample data for the past 90 days...');

for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
  const date = subDays(new Date(), dayOffset);
  const dateStr = format(date, 'yyyy-MM-dd');

  // 每天随机选择活跃用户
  const activeUserCount = Math.floor(Math.random() * 5) + 3;
  const activeUsers = users.sort(() => Math.random() - 0.5).slice(0, activeUserCount);

  activeUsers.forEach(user => {
    // 每个用户每天1-5个会话
    const sessionCount = Math.floor(Math.random() * 5) + 1;

    for (let s = 0; s < sessionCount; s++) {
      const sessionId = uuidv4();
      const repo = repositories[Math.floor(Math.random() * repositories.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const mode = modes[Math.floor(Math.random() * modes.length)];

      const startHour = Math.floor(Math.random() * 10) + 8; // 8 AM - 6 PM
      const startedAt = addHours(date, startHour);
      const duration = Math.floor(Math.random() * 120) + 10; // 10-130 minutes
      const endedAt = new Date(startedAt.getTime() + duration * 60000);

      insertSession.run(
        sessionId,
        user.id,
        repo.id,
        model,
        mode,
        startedAt.toISOString(),
        endedAt.toISOString(),
        'completed'
      );

      // 每个会话5-30条消息
      const messageCount = Math.floor(Math.random() * 25) + 5;
      for (let m = 0; m < messageCount; m++) {
        const role = m % 2 === 0 ? 'user' : 'assistant';
        const tokens = Math.floor(Math.random() * 500) + 50;
        insertMessage.run(
          uuidv4(),
          sessionId,
          role,
          `Sample ${role} message ${m}`,
          tokens,
          new Date(startedAt.getTime() + m * 60000).toISOString()
        );
      }

      // 每个会话0-10个代码编辑
      const editCount = Math.floor(Math.random() * 10);
      for (let e = 0; e < editCount; e++) {
        const isAiGenerated = Math.random() > 0.3;
        const isAccepted = isAiGenerated ? Math.random() > 0.2 : true;
        const linesAdded = Math.floor(Math.random() * 50) + 1;
        const linesRemoved = Math.floor(Math.random() * 20);

        insertEdit.run(
          uuidv4(),
          sessionId,
          user.id,
          repo.id,
          `/src/${['components', 'utils', 'services', 'hooks'][Math.floor(Math.random() * 4)]}/file${e}.ts`,
          linesAdded,
          linesRemoved,
          isAiGenerated ? 1 : 0,
          isAccepted ? 1 : 0,
          editTypes[Math.floor(Math.random() * editTypes.length)],
          workCategories[Math.floor(Math.random() * workCategories.length)],
          new Date(startedAt.getTime() + e * 120000).toISOString()
        );
      }

      // Tab补全
      const suggestions = Math.floor(Math.random() * 50) + 10;
      const accepted = Math.floor(suggestions * (0.5 + Math.random() * 0.4));
      insertCompletion.run(
        uuidv4(),
        user.id,
        sessionId,
        suggestions,
        accepted,
        startedAt.toISOString()
      );

      // 有一定概率创建PR
      if (Math.random() > 0.85) {
        const prLinesAdded = Math.floor(Math.random() * 200) + 10;
        const prLinesRemoved = Math.floor(Math.random() * 50);
        const aiLinesAdded = Math.floor(prLinesAdded * (0.3 + Math.random() * 0.5));
        const isMerged = Math.random() > 0.3;

        insertPR.run(
          uuidv4(),
          repo.id,
          user.id,
          sessionId,
          `${['Fix', 'Add', 'Update', 'Refactor'][Math.floor(Math.random() * 4)]} ${['bug', 'feature', 'component', 'service'][Math.floor(Math.random() * 4)]}`,
          isMerged ? 'merged' : 'open',
          prLinesAdded,
          prLinesRemoved,
          aiLinesAdded,
          startedAt.toISOString(),
          isMerged ? endedAt.toISOString() : null
        );
      }
    }
  });
}

// 生成每日统计汇总
const insertDailyStat = db.prepare(`
  INSERT OR REPLACE INTO daily_stats (id, date, team_id, active_users, total_sessions, total_messages, total_edits, ai_edits, accepted_edits, total_completions, accepted_completions, prs_opened, prs_merged)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
  const date = subDays(new Date(), dayOffset);
  const dateStr = format(date, 'yyyy-MM-dd');

  teams.forEach(team => {
    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT s.user_id) as active_users,
        COUNT(DISTINCT s.id) as total_sessions
      FROM agent_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE DATE(s.started_at) = ? AND u.team_id = ?
    `).get(dateStr, team.id) as any;

    const messageStats = db.prepare(`
      SELECT COUNT(*) as total
      FROM messages m
      JOIN agent_sessions s ON m.session_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE DATE(m.created_at) = ? AND u.team_id = ?
    `).get(dateStr, team.id) as any;

    const editStats = db.prepare(`
      SELECT
        COUNT(*) as total_edits,
        SUM(CASE WHEN is_ai_generated = 1 THEN 1 ELSE 0 END) as ai_edits,
        SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted_edits
      FROM code_edits e
      JOIN users u ON e.user_id = u.id
      WHERE DATE(e.created_at) = ? AND u.team_id = ?
    `).get(dateStr, team.id) as any;

    const completionStats = db.prepare(`
      SELECT
        COALESCE(SUM(suggestions_count), 0) as total,
        COALESCE(SUM(accepted_count), 0) as accepted
      FROM tab_completions c
      JOIN users u ON c.user_id = u.id
      WHERE DATE(c.created_at) = ? AND u.team_id = ?
    `).get(dateStr, team.id) as any;

    const prStats = db.prepare(`
      SELECT
        COUNT(*) as opened,
        SUM(CASE WHEN status = 'merged' THEN 1 ELSE 0 END) as merged
      FROM pull_requests p
      JOIN users u ON p.user_id = u.id
      WHERE DATE(p.created_at) = ? AND u.team_id = ?
    `).get(dateStr, team.id) as any;

    insertDailyStat.run(
      uuidv4(),
      dateStr,
      team.id,
      stats?.active_users || 0,
      stats?.total_sessions || 0,
      messageStats?.total || 0,
      editStats?.total_edits || 0,
      editStats?.ai_edits || 0,
      editStats?.accepted_edits || 0,
      completionStats?.total || 0,
      completionStats?.accepted || 0,
      prStats?.opened || 0,
      prStats?.merged || 0
    );
  });
}

console.log('Sample data generated successfully!');
console.log(`Created ${teams.length} teams, ${users.length} users, ${repositories.length} repositories`);
