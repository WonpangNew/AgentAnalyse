import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download } from 'lucide-react';
import type { WorkCategory } from '../../types';

interface WorkCategoryChartProps {
  data: WorkCategory[];
  onExport?: () => void;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CATEGORY_LABELS: Record<string, string> = {
  bug_fix: 'Bug 修复',
  new_feature: '新功能',
  refactoring: '重构',
  documentation: '文档',
  testing: '测试',
  optimization: '优化',
};

export function WorkCategoryChart({ data, onExport }: WorkCategoryChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: CATEGORY_LABELS[d.category] || d.category,
    aiPercentage: d.lines_added > 0 ? Math.round((d.ai_lines / d.lines_added) * 100) : 0,
  }));

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">工作类型分布</h3>
          <p className="text-sm text-gray-400">按工作类型分类的编辑统计</p>
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

      <div className="flex items-center">
        <div className="h-64 w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#f3f4f6',
                }}
                formatter={(value: number) => [
                  `${value} (${Math.round((value / total) * 100)}%)`,
                  '编辑数',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-2">
          {chartData.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-100">
                  {item.count}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  AI {item.aiPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
