import { Router, Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

const router = Router();

// 解析筛选参数
function parseFilters(req: Request) {
  const { teamId, userId, repositoryId, startDate, endDate } = req.query;

  return {
    teamId: teamId as string | undefined,
    userId: userId as string | undefined,
    repositoryId: repositoryId as string | undefined,
    dateRange: startDate && endDate ? {
      startDate: startDate as string,
      endDate: endDate as string
    } : undefined
  };
}

// 获取概览统计
router.get('/overview', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const stats = analyticsService.getOverviewStats(filters);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Failed to fetch overview statistics' });
  }
});

// 获取每日趋势
router.get('/daily-trend', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const trend = analyticsService.getDailyTrend(filters);
    res.json(trend);
  } catch (error) {
    console.error('Error fetching daily trend:', error);
    res.status(500).json({ error: 'Failed to fetch daily trend' });
  }
});

// 获取用户排行榜
router.get('/leaderboard', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = analyticsService.getUserLeaderboard(filters, limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 获取仓库统计
router.get('/repositories', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const stats = analyticsService.getRepositoryStats(filters);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching repository stats:', error);
    res.status(500).json({ error: 'Failed to fetch repository statistics' });
  }
});

// 获取工作类型分布
router.get('/work-categories', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const distribution = analyticsService.getWorkCategoryDistribution(filters);
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching work category distribution:', error);
    res.status(500).json({ error: 'Failed to fetch work category distribution' });
  }
});

// 获取模型使用统计
router.get('/model-usage', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const stats = analyticsService.getModelUsageStats(filters);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching model usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch model usage statistics' });
  }
});

// 导出数据
router.get('/export/:type', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req);
    const { type } = req.params;

    let data: any[];
    let filename: string;

    switch (type) {
      case 'overview':
        const overview = analyticsService.getOverviewStats(filters);
        data = [overview];
        filename = 'overview-stats.csv';
        break;
      case 'daily-trend':
        data = analyticsService.getDailyTrend(filters);
        filename = 'daily-trend.csv';
        break;
      case 'leaderboard':
        data = analyticsService.getUserLeaderboard(filters, 100);
        filename = 'user-leaderboard.csv';
        break;
      case 'repositories':
        data = analyticsService.getRepositoryStats(filters);
        filename = 'repository-stats.csv';
        break;
      case 'work-categories':
        data = analyticsService.getWorkCategoryDistribution(filters);
        filename = 'work-categories.csv';
        break;
      case 'model-usage':
        data = analyticsService.getModelUsageStats(filters);
        filename = 'model-usage.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const csv = analyticsService.exportToCSV(data, filename);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// 获取团队列表
router.get('/teams', (req: Request, res: Response) => {
  try {
    const teams = analyticsService.getTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// 获取用户列表
router.get('/users', (req: Request, res: Response) => {
  try {
    const { teamId } = req.query;
    const users = analyticsService.getUsers(teamId as string | undefined);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
