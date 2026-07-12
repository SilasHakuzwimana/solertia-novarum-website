import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
} from "lucide-react";
import { DataTableProps } from "../../types";

interface ExtendedDataTableProps extends DataTableProps {
  onReply?: (item: any) => void;
  showReply?: boolean;
}

export const DataTable: React.FC<ExtendedDataTableProps> = ({
  data,
  columns,
  onView,
  onDelete,
  onRefresh,
  onReply,
  searchPlaceholder = "Search...",
  searchFields = [],
  loading = false,
  emptyMessage = "No items found",
  showRowNumbers = true,
  pageSize = 5,
  showReply = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = field.split(".").reduce((obj, key) => obj?.[key], item);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchFields]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Search and Refresh Bar */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md text-slate-950">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-slate-950 bg-white pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-800">{totalItems} items</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-[#007aff] hover:bg-[#0055b3] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {showRowNumbers && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                  #
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 text-slate-900 transition-colors"
              >
                {showRowNumbers && (
                  <td className="px-4 py-4 text-sm text-slate-500 text-center">
                    {startIndex + index + 1}
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${col.key}`}
                    className="px-6 py-4 text-sm"
                  >
                    {col.render
                      ? col.render(
                          col.key
                            .split(".")
                            .reduce((obj, key) => obj?.[key], item),
                          item,
                        )
                      : col.key
                          .split(".")
                          .reduce((obj, key) => obj?.[key], item) || "-"}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(item)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>
                    {showReply && onReply && (
                      <button
                        onClick={() => onReply(item)}
                        className="p-1 text-green-500 hover:text-green-700 transition-colors"
                        title="Send reply"
                      >
                        <Mail className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (showRowNumbers ? 2 : 1)}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1} to {endIndex} of {totalItems} items
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  currentPage === page
                    ? "bg-[#007aff] text-white"
                    : "bg-[#cac6c6] hover:bg-slate-600 text-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
