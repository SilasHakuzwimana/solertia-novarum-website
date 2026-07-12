import React, { useState, useRef } from "react";
import {
  FileText,
  FileSpreadsheet,
  File,
  FileDown,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Briefcase,
  Users,
  Mail,
  Send,
  User,
} from "lucide-react";
import ReportingService from "../services/reporting.service";

interface ReportingPanelProps {
  data: {
    partnerships: any[];
    applications: any[];
  };
  onClose: () => void;
  token: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  adminEmail?: string;
}

type ExportFormat = "pdf" | "excel" | "csv" | "word";

const ReportingPanel: React.FC<ReportingPanelProps> = ({
  data,
  onClose,
  token,
  onRefresh,
  isLoading = false,
  adminEmail = "",
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [reportType, setReportType] = useState<
    "Partnerships" | "Applications" | "Both"
  >("Both");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isExporting = useRef(false);

  // Email state
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const getReportButtonText = () => {
    switch (reportType) {
      case "Partnerships":
        return "Generate Partnerships Report";
      case "Applications":
        return "Generate Applications Report";
      case "Both":
        return "Generate Combined Report";
      default:
        return "Generate Report";
    }
  };

  const handleExport = async () => {
    if (isExporting.current || loading) return;
    isExporting.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reports = [];
      const columns = {
        partnerships: [
          "id",
          "company_name",
          "contact_name",
          "email",
          "project_scope",
          "budget_range",
          "selected_services",
          "status",
          "created_at",
        ],
        applications: [
          "id",
          "full_name",
          "email",
          "track_id",
          "education_level",
          "institution",
          "experience_level",
          "status",
          "created_at",
        ],
      };

      const isDateInRange = (
        dateStr: string,
        startDate: string,
        endDate: string,
      ) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const compareDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const start = new Date(startDate);
        const startCompare = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        );
        const end = new Date(endDate);
        const endCompare = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );

        return compareDate >= startCompare && compareDate <= endCompare;
      };

      const filteredPartnerships =
        data.partnerships?.filter((p) => {
          return isDateInRange(p.created_at, dateRange.start, dateRange.end);
        }) || [];

      const filteredApplications =
        data.applications?.filter((a) => {
          return isDateInRange(a.created_at, dateRange.start, dateRange.end);
        }) || [];

      if (reportType === "Partnerships" || reportType === "Both") {
        if (filteredPartnerships.length > 0) {
          reports.push({
            title: "Partnerships Report",
            filename: `Partnerships Report`,
            columns: columns.partnerships,
            data: filteredPartnerships,
            dateRange,
            includeMetadata,
          });
        }
      }

      if (reportType === "Applications" || reportType === "Both") {
        if (filteredApplications.length > 0) {
          reports.push({
            title: "Applications Report",
            filename: `Applications Report`,
            columns: columns.applications,
            data: filteredApplications,
            dateRange,
            includeMetadata,
          });
        }
      }

      if (reports.length === 0) {
        setError(
          "No data found for the selected filters. Please adjust your criteria.",
        );
        setLoading(false);
        isExporting.current = false;
        return;
      }

      for (const report of reports) {
        switch (selectedFormat) {
          case "pdf":
            await ReportingService.exportToPDF(report);
            break;
          case "excel":
            await ReportingService.exportToExcel(report);
            break;
          case "csv":
            await ReportingService.exportToCSV(report);
            break;
          case "word":
            await ReportingService.exportToWord(report);
            break;
        }
      }

      const reportCount = reports.length;
      const formatLabel = selectedFormat.toUpperCase();
      setSuccess(
        `✅ Successfully exported ${reportCount} report(s) in ${formatLabel} format`,
      );

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setError("❌ Failed to generate report. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isExporting.current = false;
      }, 1000);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo) {
      setEmailError("Please enter a recipient email address.");
      return;
    }

    if (!emailTo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const isDateInRange = (
        dateStr: string,
        startDate: string,
        endDate: string,
      ) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const compareDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const start = new Date(startDate);
        const startCompare = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        );
        const end = new Date(endDate);
        const endCompare = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );

        return compareDate >= startCompare && compareDate <= endCompare;
      };

      const columns = {
        partnerships: [
          "id",
          "company_name",
          "contact_name",
          "email",
          "project_scope",
          "budget_range",
          "selected_services",
          "status",
          "created_at",
        ],
        applications: [
          "id",
          "full_name",
          "email",
          "track_id",
          "education_level",
          "institution",
          "experience_level",
          "status",
          "created_at",
        ],
      };

      const filteredPartnerships =
        data.partnerships?.filter((p) => {
          return isDateInRange(p.created_at, dateRange.start, dateRange.end);
        }) || [];

      const filteredApplications =
        data.applications?.filter((a) => {
          return isDateInRange(a.created_at, dateRange.start, dateRange.end);
        }) || [];

      let reportData = null;
      let reportTitle = "";

      if (reportType === "Partnerships" || reportType === "Both") {
        if (filteredPartnerships.length > 0) {
          reportData = {
            title: "Partnerships Report",
            filename: `Partnerships Report_${dateRange.start}_${dateRange.end}`,
            columns: columns.partnerships,
            data: filteredPartnerships,
            dateRange,
          };
          reportTitle = "Partnerships Report";
        }
      }

      if (reportType === "Applications" || reportType === "Both") {
        if (filteredApplications.length > 0) {
          reportData = {
            title: "Applications Report",
            filename: `Applications Report_${dateRange.start}_${dateRange.end}`,
            columns: columns.applications,
            data: filteredApplications,
            dateRange,
          };
          reportTitle = "Applications Report";
        }
      }

      if (!reportData) {
        setEmailError("No data found for the selected filters.");
        setSendingEmail(false);
        return;
      }

      if (reportType === "Both") {
        const combinedData = {
          title: "Combined Report - Partnerships & Applications",
          filename: `Combined Report_${dateRange.start}_${dateRange.end}`,
          columns: [
            "Type",
            ...columns.partnerships.filter((col) => col !== "id"),
          ],
          data: [
            ...filteredPartnerships.map((p) => ({
              Type: "Partnership",
              ...p,
            })),
            ...filteredApplications.map((a) => ({
              Type: "Application",
              ...a,
            })),
          ],
          dateRange,
        };
        reportData = combinedData;
      }

      const response = await fetch("/api/email/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emailTo,
          subject:
            emailSubject ||
            `📊 Solvertia Novarum Report - ${new Date().toISOString().split("T")[0]}`,
          message:
            emailMessage ||
            "Please find the attached report from the Solvertia Novarum Admin Dashboard.",
          reportData: reportData,
          format: selectedFormat,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSuccess(`✅ Report sent successfully to ${emailTo}`);
        setEmailTo("");
        setEmailSubject("");
        setEmailMessage("");
        setTimeout(() => setEmailSuccess(null), 5000);
        setTimeout(() => setShowEmail(false), 3000);
      } else {
        setEmailError(result.error || "Failed to send email.");
      }
    } catch (err) {
      console.error("Send email error:", err);
      setEmailError("❌ Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "excel":
        return <FileSpreadsheet className="w-5 h-5" />;
      case "csv":
        return <File className="w-5 h-5" />;
      case "word":
        return <FileDown className="w-5 h-5" />;
    }
  };

  const getTotalRecords = () => {
    const isDateInRange = (
      dateStr: string,
      startDate: string,
      endDate: string,
    ) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const compareDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const start = new Date(startDate);
      const startCompare = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const end = new Date(endDate);
      const endCompare = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
      );

      return compareDate >= startCompare && compareDate <= endCompare;
    };

    const partnerships =
      data.partnerships?.filter((p) => {
        return isDateInRange(p.created_at, dateRange.start, dateRange.end);
      }) || [];

    const applications =
      data.applications?.filter((a) => {
        return isDateInRange(a.created_at, dateRange.start, dateRange.end);
      }) || [];

    return {
      partnerships: partnerships.length,
      applications: applications.length,
    };
  };

  const totals = getTotalRecords();
  const totalRecords =
    (data.partnerships?.length || 0) + (data.applications?.length || 0);
  const hasData = totals.partnerships > 0 || totals.applications > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#007aff]" />
            Generate {reportType} Report
          </h3>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Data Source Info */}
          <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 font-medium">Data Source:</span>
              <span className="text-blue-600">
                {totalRecords} records available
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {data.partnerships?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {data.applications?.length || 0}
              </span>
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-3 gap-3 text-slate-950">
              {[
                { id: "Partnerships", label: "Partnerships", icon: Briefcase },
                { id: "Applications", label: "Applications", icon: Users },
                { id: "Both", label: "Both", icon: FileText },
              ].map((type) => {
                const Icon = type.icon;
                const isActive = reportType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as any)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      isActive
                        ? "border-[#007aff] bg-[#007aff]/5 text-[#007aff] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-[#007aff]" : "text-slate-500"}`}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 text-slate-950">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-3 py-2 text-slate-950 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-3 py-2 text-slate-950 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(["pdf", "excel", "csv", "word"] as ExportFormat[]).map(
                (format) => {
                  const isActive = selectedFormat === format;
                  return (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        isActive
                          ? "border-[#007aff] bg-[#007aff]/5 text-[#007aff] shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={
                          isActive ? "text-[#007aff]" : "text-slate-500"
                        }
                      >
                        {getFormatIcon(format)}
                      </span>
                      <span
                        className={`text-sm font-medium uppercase ${isActive ? "text-[#007aff]" : "text-slate-600"}`}
                      >
                        {format}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-[#007aff] focus:ring-[#007aff] border-slate-300 rounded bg-white"
              />
              <span>Include metadata</span>
            </label>
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors text-sm font-medium"
            >
              <>
                <span className="flex items-center gap-1 text-blue-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  {showEmail ? "Hide Email" : "Send via Email"}
                </span>
              </>
            </button>
          </div>

          {/* Email Section */}
          {showEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Send Report via Email</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To Email *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 px-3 py-2 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm transition-all duration-200"
                  />
                  {adminEmail && (
                    <button
                      onClick={() => setEmailTo(adminEmail)}
                      className="px-3 py-2 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 rounded-lg transition-colors text-sm whitespace-nowrap font-medium"
                      title="Use admin email"
                    >
                      <User className="w-4 h-4 inline mr-1" />
                      Admin
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={`📊 Solvertia Novarum Report - ${new Date().toISOString().split("T")[0]}`}
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Please find the attached report from the Solvertia Novarum Admin Dashboard."
                  rows={2}
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm resize-none transition-all duration-200"
                />
              </div>
              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
              {emailSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{emailSuccess}</span>
                </div>
              )}
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !hasData}
                className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  sendingEmail || !hasData
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-linear-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send {reportType} Report via Email
                  </>
                )}
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-100">
            <p className="text-sm font-medium text-slate-700">Report Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-600">
                Partnerships:{" "}
                <span className="font-semibold text-slate-900">
                  {totals.partnerships}
                </span>
              </div>
              <div className="text-slate-600">
                Applications:{" "}
                <span className="font-semibold text-slate-900">
                  {totals.applications}
                </span>
              </div>
              <div className="text-slate-600">
                Date Range:{" "}
                <span className="font-semibold text-slate-900">
                  {dateRange.start} to {dateRange.end}
                </span>
              </div>
              <div className="text-slate-600">
                Format:{" "}
                <span className="font-semibold text-slate-900 uppercase">
                  {selectedFormat}
                </span>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleExport}
              disabled={loading || !hasData}
              className={`flex-1 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading || !hasData
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {getReportButtonText()}
                </>
              )}
            </button>
            <div className=" text-slate-950  hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>

          {!hasData && totalRecords > 0 && (
            <p className="text-sm text-amber-600 text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
              No records found in the selected date range. Try adjusting the
              filters.
            </p>
          )}

          {totalRecords === 0 && (
            <p className="text-sm text-amber-600 text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
              No data available. Please refresh the dashboard first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingPanel;
