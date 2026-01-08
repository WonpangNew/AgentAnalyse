import { useState, useEffect } from 'react';
import { Calendar, Users, Building2 } from 'lucide-react';
import type { Team, User, FilterOptions } from '../types';
import { getTeams, getUsers } from '../services/api';
import { format, subDays } from 'date-fns';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const DATE_RANGES = [
  { label: '过去7天', days: 7 },
  { label: '过去30天', days: 30 },
  { label: '过去90天', days: 90 },
  { label: '过去365天', days: 365 },
];

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRange, setSelectedRange] = useState(30);

  useEffect(() => {
    getTeams().then(setTeams).catch(console.error);
  }, []);

  useEffect(() => {
    getUsers(filters.teamId).then(setUsers).catch(console.error);
  }, [filters.teamId]);

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
    onFilterChange({
      ...filters,
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleTeamChange = (teamId: string) => {
    onFilterChange({
      ...filters,
      teamId: teamId || undefined,
      userId: undefined,
    });
  };

  const handleUserChange = (userId: string) => {
    onFilterChange({
      ...filters,
      userId: userId || undefined,
    });
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* 日期范围选择 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => handleRangeChange(range.days)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedRange === range.days
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* 团队筛选 */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <select
            value={filters.teamId || ''}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">全部团队</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* 用户筛选 */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <select
            value={filters.userId || ''}
            onChange={(e) => handleUserChange(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">全部用户</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* 日期显示 */}
        <div className="ml-auto text-sm text-gray-400">
          {filters.startDate} 至 {filters.endDate}
        </div>
      </div>
    </div>
  );
}
