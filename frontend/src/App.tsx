import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import {
  Users,
  Activity,
  Code,
  CheckCircle,
  Zap,
  GitPullRequest,
} from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StatCard } from './components/StatCard';
import { TrendChart } from './components/charts/TrendChart';
import { ModelUsageChart } from './components/charts/ModelUsageChart';
import { WorkCategoryChart } from './components/charts/WorkCategoryChart';
import { Leaderboard } from './components/Leaderboard';
import { RepositoryTable } from './components/RepositoryTable';
import { MessageStats } from './components/MessageStats';
import {
  getOverviewStats,
  getDailyTrend,
  getLeaderboard,
  getRepositoryStats,
  getWorkCategories,
  getModelUsage,
  getExportUrl,
} from './services/api';
import type {
  FilterOptions,
  OverviewStats,
  DailyTrend,
  LeaderboardUser,
  RepositoryStats,
  WorkCategory,
  ModelUsage,
} from './types';

function App() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [repositories, setRepositories] = useState<RepositoryStats[]>([]);
  const [workCategories, setWorkCategories] = useState<WorkCategory[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        overviewData,
        trendData,
        leaderboardData,
        repoData,
        categoryData,
        modelData,
      ] = await Promise.all([
        getOverviewStats(filters),
        getDailyTrend(filters),
        getLeaderboard(filters),
        getRepositoryStats(filters),
        getWorkCategories(filters),
        getModelUsage(filters),
      ]);

      setOverview(overviewData);
      setDailyTrend(trendData);
      setLeaderboard(leaderboardData);
      setRepositories(repoData);
      setWorkCategories(categoryData);
      setModelUsage(modelData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (type: string) => {
    const url = getExportUrl(type, filters);
    window.open(url, '_blank');
  };

  const handleExportAll = () => {
    const types = ['overview', 'daily-trend', 'leaderboard', 'repositories', 'work-categories', 'model-usage'];
    types.forEach((type, index) => {
      setTimeout(() => handleExport(type), index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onExport={handleExportAll} onRefresh={fetchData} loading={loading} />
      <FilterBar filters={filters} onFilterChange={setFilters} />

      <main className="p-6 max-w-7xl mx-auto">
        {/* 概览统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="活跃用户"
            value={overview?.activeUsers || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="总会话数"
            value={overview?.totalSessions || 0}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="AI 代码占比"
            value={`${overview?.aiCodePercentage || 0}%`}
            icon={Code}
            color="green"
          />
          <StatCard
            title="编辑接受率"
            value={`${overview?.editAcceptanceRate || 0}%`}
            icon={CheckCircle}
            color="orange"
          />
          <StatCard
            title="Tab补全"
            value={overview?.tabCompletions.total.toLocaleString() || '0'}
            subtitle={`接受率 ${overview?.tabCompletions.rate || 0}%`}
            icon={Zap}
            color="pink"
          />
          <StatCard
            title="PR 合并数"
            value={overview?.pullRequests.merged || 0}
            subtitle={`共开启 ${overview?.pullRequests.opened || 0} 个`}
            icon={GitPullRequest}
            color="blue"
          />
        </div>

        {/* 趋势图表 */}
        <div className="mb-6">
          <TrendChart
            data={dailyTrend}
            onExport={() => handleExport('daily-trend')}
          />
        </div>

        {/* 消息统计和模型使用 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MessageStats
            byMode={overview?.messagesByMode || []}
            byModel={overview?.messagesByModel || []}
          />
          <ModelUsageChart
            data={modelUsage}
            onExport={() => handleExport('model-usage')}
          />
        </div>

        {/* 工作类型分布和排行榜 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WorkCategoryChart
            data={workCategories}
            onExport={() => handleExport('work-categories')}
          />
          <Leaderboard
            data={leaderboard}
            onExport={() => handleExport('leaderboard')}
          />
        </div>

        {/* 仓库统计 */}
        <div className="mb-6">
          <RepositoryTable
            data={repositories}
            onExport={() => handleExport('repositories')}
          />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>Agent Analytics Dashboard</span>
          <span>数据更新于 {format(new Date(), 'yyyy-MM-dd HH:mm')}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
