import React from "react";
import { ChevronRight } from "lucide-react";
import { Partnership, Application } from "../../types";

interface RecentActivityProps {
  type: "partnerships" | "applications";
  items: Partnership[] | Application[];
  title: string;
  onViewAll: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  type,
  items,
  title,
  onViewAll,
}) => {
  const getSubtitle = (item: Partnership | Application) => {
    if (type === "partnerships") {
      return (item as Partnership).contact_name;
    }
    return `${(item as Application).track_id.toUpperCase()} Track`;
  };

  const getName = (item: Partnership | Application) => {
    if (type === "partnerships") {
      return (item as Partnership).company_name;
    }
    return (item as Application).full_name;
  };

  return (
    <div className="bg-white text-blue-800 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button
          onClick={onViewAll}
          className="text-sm text-slate-950 hover:text-[#0055b3] flex items-center gap-1 cursor-pointer"
        >
          View all{" "}
          <ChevronRight className="w-4 h-4 text-blue-800 cursor-pointer" />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="px-6 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{getName(item)}</p>
                <p className="text-sm text-slate-500">{getSubtitle(item)}</p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-400">
            No {type} found
          </div>
        )}
      </div>
    </div>
  );
};
