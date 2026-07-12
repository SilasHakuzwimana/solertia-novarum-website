import React from 'react';
import { LayoutDashboard, FileText, RefreshCw, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  username: string;
  onRefresh: () => void;
  onLogout: () => void;
  onReports: () => void;
  loading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  username,
  onRefresh,
  onLogout,
  onReports,
  loading = false,
}) => {
  return (
    <header className="bg-linear-to-r from-[#072421] via-[#0d2e29] to-[#123832] border-b border-teal-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <span className="text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
              {username}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReports}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Reports
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-teal-300 hover:text-white hover:bg-teal-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
