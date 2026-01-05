import { Trophy, Download, Bot } from 'lucide-react';
import type { LeaderboardUser } from '../types';

interface LeaderboardProps {
  data: LeaderboardUser[];
  onExport?: () => void;
}

export function Leaderboard({ data, onExport }: LeaderboardProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{rank}</span>;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">使用排行榜</h3>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        )}
      </div>

      <div className="space-y-3">
        {data.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankBadge(index + 1)}
            </div>

            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
              {user.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-sm text-gray-500 truncate">{user.email}</div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{user.session_count}</div>
                <div className="text-gray-500">会话</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{user.active_days}</div>
                <div className="text-gray-500">活跃天</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  +{(user.ai_lines_accepted || 0).toLocaleString()}
                </div>
                <div className="text-gray-500">AI行数</div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                <Bot className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  {user.favorite_model?.replace('claude-3-', '').replace('gpt-', 'GPT-') || '-'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
}
