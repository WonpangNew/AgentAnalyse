import { LucideIcon, TrendingUp, TrendingDown, Download } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  exportType?: string;
  onExport?: (type: string) => void;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  pink: 'bg-pink-50 text-pink-600',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  exportType,
  onExport,
}: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {exportType && onExport && (
          <button
            onClick={() => onExport(exportType)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded transition-all"
            title="导出数据"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {trend !== undefined && (
            <span
              className={`flex items-center text-sm font-medium ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-0.5" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-0.5" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
