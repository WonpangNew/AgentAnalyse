import { GitBranch, Download, ExternalLink } from 'lucide-react';
import type { RepositoryStats } from '../types';

interface RepositoryTableProps {
  data: RepositoryStats[];
  onExport?: () => void;
}

export function RepositoryTable({ data, onExport }: RepositoryTableProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">仓库统计</h3>
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">仓库</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">总编辑数</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">新增行数</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">AI 代码占比</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">PR 数量</th>
            </tr>
          </thead>
          <tbody>
            {data.map((repo) => (
              <tr
                key={repo.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{repo.name}</div>
                      {repo.url && (
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                        >
                          查看仓库 <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">
                  {repo.total_edits.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-green-600">+{repo.lines_added.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${repo.aiPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">
                      {repo.aiPercentage}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">
                  {repo.pr_count}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
