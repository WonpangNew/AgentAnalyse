import { MessageSquare } from 'lucide-react';

interface MessageStatsProps {
  byMode: { mode: string; count: number }[];
  byModel: { model: string; count: number }[];
}

const MODE_LABELS: Record<string, string> = {
  chat: '对话模式',
  agent: 'Agent模式',
  composer: 'Composer模式',
};

export function MessageStats({ byMode, byModel }: MessageStatsProps) {
  const totalMessages = byMode.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-100">消息统计</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 按模式 */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">按模式</h4>
          <div className="space-y-3">
            {byMode.map((item) => {
              const percentage = totalMessages > 0
                ? Math.round((item.count / totalMessages) * 100)
                : 0;

              return (
                <div key={item.mode}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">
                      {MODE_LABELS[item.mode] || item.mode}
                    </span>
                    <span className="font-medium text-gray-100">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 按模型 */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">按模型</h4>
          <div className="space-y-3">
            {byModel.slice(0, 5).map((item) => {
              const percentage = totalMessages > 0
                ? Math.round((item.count / totalMessages) * 100)
                : 0;

              return (
                <div key={item.model}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">
                      {item.model.replace('claude-3-', '').replace('gpt-', 'GPT-')}
                    </span>
                    <span className="font-medium text-gray-100">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
