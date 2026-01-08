import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import type { DailyTrend } from '../../types';
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
  data: DailyTrend[];
  onExport?: () => void;
}

export function TrendChart({ data, onExport }: TrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MM/dd'),
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">每日使用趋势</h3>
          <p className="text-sm text-gray-400">活跃用户、会话和编辑数量</p>
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

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEdits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                color: '#f3f4f6',
              }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Area
              type="monotone"
              dataKey="active_users"
              name="活跃用户"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorUsers)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              name="会话数"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorSessions)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ai_edits"
              name="AI编辑数"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorEdits)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
