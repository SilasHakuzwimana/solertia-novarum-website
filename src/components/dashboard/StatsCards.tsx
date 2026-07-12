import React from 'react';
import { Briefcase, GraduationCap, Clock, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Partnerships',
      value: stats.total.partnerships,
      today: stats.today.partnerships,
      icon: Briefcase,
      iconColor: 'blue',
    },
    {
      title: 'Total Applications',
      value: stats.total.applications,
      today: stats.today.applications,
      icon: GraduationCap,
      iconColor: 'teal',
    },
    {
      title: 'Recent Activity',
      value: stats.recent.partnerships.length + stats.recent.applications.length,
      subtitle: 'Last 7 days',
      icon: Clock,
      iconColor: 'amber',
    },
    {
      title: 'Conversion Rate',
      value: stats.total.partnerships > 0 && stats.total.applications > 0
        ? Math.round((stats.total.partnerships / (stats.total.partnerships + stats.total.applications)) * 100)
        : 0,
      subtitle: 'Partnerships vs Applications',
      icon: TrendingUp,
      iconColor: 'purple',
    },
  ];

  const getIconBg = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/10';
      case 'teal': return 'bg-teal-500/10';
      case 'amber': return 'bg-amber-500/10';
      case 'purple': return 'bg-purple-500/10';
      default: return 'bg-slate-500/10';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-500';
      case 'teal': return 'text-teal-500';
      case 'amber': return 'text-amber-500';
      case 'purple': return 'text-purple-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
            <div className={`p-3 ${getIconBg(card.iconColor)} rounded-xl`}>
              <card.icon className={`w-6 h-6 ${getIconColor(card.iconColor)}`} />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {card.today !== undefined && (
              <span className="text-emerald-500">+{card.today}</span>
            )}
            {card.subtitle && <span>{card.subtitle}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
