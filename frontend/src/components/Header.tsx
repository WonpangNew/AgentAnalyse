import { Download, Settings, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function Header({ onExport, onRefresh, loading }: HeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Agent Analytics</h1>
            <p className="text-sm text-gray-400">Coding Agent 执行效果分析</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button onClick={onExport} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出全部
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
