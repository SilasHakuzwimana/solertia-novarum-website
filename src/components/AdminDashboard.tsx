import React, { useState, useEffect, useCallback } from "react";
import { X, LayoutDashboard, Handshake, FileText, Plus } from "lucide-react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { AuthScreen } from "./dashboard/AuthScreen";
import { StatsCards } from "./dashboard/StatsCards";
import { RecentActivity } from "./dashboard/RecentActivity";
import { DataTable } from "./dashboard/DataTable";
import ReportingPanel from "./ReportingPanel";
import { AuthService } from "../api/auth.service";
import { AdminService } from "../api/admin.service";
import {
  Partnership,
  Application,
  DashboardStats,
  RegisterData,
} from "../types";
import ReplyModal from "./dashboard/ReplyModal";
import ConfirmationModal from "./dashboard/ConfirmationModal";
import AnnouncementEditor from "./dashboard/AnnouncementEditor";
import { useAnnouncement } from "../api";
import { LoginStep } from "../types";

// Tab definitions
const TABS = [
  { key: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { key: "partnerships" as const, label: "Partnerships", icon: Handshake },
  { key: "applications" as const, label: "Applications", icon: FileText },
];

const AdminDashboard: React.FC = () => {
  // ==============================================
  // AUTH STATE
  // ==============================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // REPLY STATE
  // ==============================================
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyRecipient, setReplyRecipient] = useState<any>(null);

  // ==============================================
  // DASHBOARD DATA
  // ==============================================
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // ==============================================
  // UI STATE
  // ==============================================
  const [activeTab, setActiveTab] = useState<
    "overview" | "partnerships" | "applications"
  >("overview");
  const [selectedItem, setSelectedItem] = useState<
    Partnership | Application | null
  >(null);
  const {
    announcement,
    fetchAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncement();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReporting, setShowReporting] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState<string | null>(
    null,
  );

  // ==============================================
  // LOGIN STATE
  // ==============================================
  const [loginStep, setLoginStep] = useState<LoginStep>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resetError, setResetError] = useState("");
  const [loginToken, setLoginToken] = useState("");
  const [email, setEmail] = useState("");
  const [otpTimer, setOtpTimer] = useState(600);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string>("");
  const [resetEmail, setResetEmail] = useState<string>("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "partnership" | "application" | null
  >(null);

  //==========
  // REGISTER
  //==========
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleRegister = async (data: RegisterData) => {
    setRegisterError("");
    setRegisterSuccess("");
    setLoading(true);

    try {
      const username = data.full_name;
      const response = await AuthService.register({
        full_name: data.full_name,
        username: username,
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        confirm_password: data.confirm_password || data.password,
      });

      if (response.success) {
        setRegisterSuccess(
          "Registration successful! Please check your email for verification OTP.",
        );
        setTimeout(() => {
          setLoginStep("verify-email");
          setLoginEmail(data.email);
        }, 3000);
      } else {
        setRegisterError(response.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // ==============================================
  // LIFECYCLE EFFECTS
  // ==============================================

  // Check authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuth(parsedAuth);
        checkAuth(parsedAuth.token);
      } catch (e) {
        localStorage.removeItem("adminAuth");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setLoginEmail(emailParam);
      setLoginError("");
    }
  }, []);

  // OTP Timer
  useEffect(() => {
    if (loginStep === "otp" && otpTimer > 0) {
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loginStep, otpTimer]);

  // ==============================================
  // AUTH HANDLERS
  // ==============================================

  const checkAuth = async (token: string) => {
    try {
      const response = await AuthService.checkSession(token);
      if (
        response.data?.status === 200 &&
        response.data &&
        response.data.success
      ) {
        setIsAuthenticated(true);
        await fetchDashboardData(token);
      } else {
        localStorage.removeItem("adminAuth");
        setAuth(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("adminAuth");
      setAuth(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginError("");
    setLoading(true);
    try {
      const response = await AuthService.login(email, password);

      if (response.status === 200 && response.data?.success) {
        setLoginStep("otp");
        setLoginToken(response.data.loginToken);
        setEmail(response.data.email);
        setOtpTimer(response.data.expiresIn || 600);
        setCanResendOTP(false);
      } else if (
        response.status === 403 &&
        response.data?.requiresVerification
      ) {
        // Account not verified - redirect to verification
        setLoginError(
          response.data?.error ||
            "Account not verified. Please verify your email.",
        );
        setTimeout(() => {
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
        }, 2000);
      } else {
        setLoginError(response.data?.error || "Invalid credentials");
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setOtpError("");
    setLoading(true);
    try {
      const response = await AuthService.verifyOTP(email, otp, loginToken);
      if (response.status === 200 && response.data?.success) {
        const authData = {
          token: response.data.token,
          user: response.data.user,
        };
        setAuth(authData);
        localStorage.setItem("adminAuth", JSON.stringify(authData));
        setIsAuthenticated(true);
        setLoginStep("login");
        await fetchDashboardData(response.data.token);
      } else {
        setOtpError(response.data?.error || "Invalid OTP");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setOtpError("");
    try {
      const response = await AuthService.resendOTP(email);
      if (response.status === 200 && response.data?.success) {
        setLoginToken(response.data.loginToken);
        setOtpTimer(response.data.expiresIn || 600);
        setCanResendOTP(false);
      } else {
        setOtpError(response.data?.error || "Failed to resend OTP");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setResetError("");
    setLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);

      if (response.status === 200 && response.data?.success) {
        const resetToken = response.data.resetToken;
        const resetEmail = response.data.email;
        const expiresIn = response.data.expiresIn || 600;

        localStorage.setItem("resetToken", resetToken);
        localStorage.setItem("resetEmail", resetEmail);
        localStorage.setItem(
          "resetExpires",
          String(Date.now() + expiresIn * 1000),
        );
        localStorage.setItem("lastResetEmail", email);

        setResetToken(resetToken);
        setResetEmail(resetEmail);

        setLoginStep("reset-password");
        setEmail(email);
        setResetSuccess(false);
        setResetError("");
      } else {
        setResetError(response.data?.error || "Failed to send reset email");
      }
    } catch (error: any) {
      console.error("❌ AdminDashboard - Reset request error:", error);
      setResetError(
        error.response?.data?.error || "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    setResetError("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const resetToken = localStorage.getItem("resetToken");
      const resetEmail = localStorage.getItem("resetEmail");
      
      if (!resetToken || !resetEmail) {
        setResetError("Reset session expired. Please request a new reset.");
        setLoading(false);
        setLoginStep("forgot-password");
        return;
      }

      const response = await AuthService.resetPassword(
        resetEmail,
        otp,
        resetToken,
        newPassword,
        confirmPassword,
      );

      if (response.status === 200 && response.data?.success) {
        setResetSuccess(true);

        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetExpires");

        setTimeout(() => {
          setLoginStep("login");
          setResetSuccess(false);
          setEmail("");
        }, 3000);
      } else {
        setResetError(response.data?.error || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("❌ AdminDashboard - Reset password error:", error);
      setResetError(
        error.response?.data?.error || "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth?.token) {
      try {
        await AuthService.logout(auth.token);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("resetToken");
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("resetExpires");
    setAuth(null);
    setIsAuthenticated(false);
    setStats(null);
    setPartnerships([]);
    setApplications([]);
    setLoginStep("login");
  };

  const handleBackToLogin = () => {
    setLoginStep("login");
    setLoginError("");
    setOtpError("");
    setResetError("");
    setResetSuccess(false);
    localStorage.removeItem("resetToken");
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("resetExpires");
  };

  const handleGoToForgotPassword = () => {
    setLoginStep("forgot-password");
    setResetError("");
  };

  // ==============================================
  // DASHBOARD DATA HANDLERS
  // ==============================================

  const fetchDashboardData = async (token: string) => {
    try {
      const [statsRes, partnershipsRes, applicationsRes] = await Promise.all([
        AdminService.getStats(token),
        AdminService.getPartnerships(token),
        AdminService.getApplications(token),
      ]);

      if (statsRes.status === 200 && statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (partnershipsRes.status === 200 && partnershipsRes.data?.success) {
        setPartnerships(partnershipsRes.data.data);
      }
      if (applicationsRes.status === 200 && applicationsRes.data?.success) {
        setApplications(applicationsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    }
  };

  const refreshData = async () => {
    if (auth?.token) {
      setLoading(true);
      await fetchDashboardData(auth.token);
      setLoading(false);
    }
  };

  // ==============================================
  // REPLY HANDLERS
  // ==============================================

  const handleReply = (item: any) => {
    const isPartnership = "company_name" in item;
    setReplyRecipient({
      email: item.email,
      name: isPartnership ? item.contact_name : item.full_name,
      type: isPartnership ? "partnership" : "application",
      company: isPartnership ? item.company_name : undefined,
      track: !isPartnership ? item.track_id : undefined,
    });
    setShowReplyModal(true);
  };

  // ==============================================
  // DELETE HANDLERS
  // ==============================================

  const handleDeletePartnership = async (id: number) => {
    setDeleteTargetId(id);
    setDeleteType("partnership");
    setShowDeleteModal(true);
  };

  const handleDeleteApplication = async (id: number) => {
    setDeleteTargetId(id);
    setDeleteType("application");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null || deleteType === null) return;

    setIsDeleting(true);
    try {
      let response;
      if (deleteType === "partnership") {
        response = await AdminService.deletePartnership(
          auth.token,
          deleteTargetId,
        );
        if (response.status === 200) {
          setPartnerships(partnerships.filter((p) => p.id !== deleteTargetId));
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  total: {
                    ...prev.total,
                    partnerships: prev.total.partnerships - 1,
                  },
                }
              : null,
          );
        }
      } else {
        response = await AdminService.deleteApplication(
          auth.token,
          deleteTargetId,
        );
        if (response.status === 200) {
          setApplications(applications.filter((a) => a.id !== deleteTargetId));
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  total: {
                    ...prev.total,
                    applications: prev.total.applications - 1,
                  },
                }
              : null,
          );
        }
      }

      if (response?.status === 200) {
        // Close modal on success
        setShowDeleteModal(false);
        setDeleteTargetId(null);
        setDeleteType(null);

        // Optional: Show success toast here
        // toast.success(`${deleteType === "partnership" ? "Partnership" : "Application"} deleted successfully`);
      } else {
        alert(response?.data?.error || `Failed to delete ${deleteType}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshAnnouncement = useCallback(async () => {
    if (auth?.token) {
      setAnnouncementLoading(true);
      setAnnouncementError(null);
      try {
        await fetchAnnouncement(auth.token);
      } catch (err) {
        setAnnouncementError("Failed to load announcement");
      } finally {
        setAnnouncementLoading(false);
      }
    }
  }, [fetchAnnouncement, auth?.token]);

  useEffect(() => {
    if (isAuthenticated && auth?.token) {
      refreshAnnouncement();
    }
  }, [isAuthenticated, auth?.token]);

  // ==============================================
  // RENDER - AUTH SCREEN (Not Authenticated)
  // ==============================================

  if (!isAuthenticated) {
    return (
      <AuthScreen
        step={loginStep}
        loading={loading}
        loginError={loginError}
        loginEmail={loginEmail}
        otpError={otpError}
        resetError={resetError}
        email={email}
        otpTimer={otpTimer}
        canResendOTP={canResendOTP}
        resetSuccess={resetSuccess}
        onLogin={handleLogin}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        onForgotPassword={handleForgotPassword}
        onResetPassword={handleResetPassword}
        onBackToLogin={handleBackToLogin}
        onGoToForgotPassword={handleGoToForgotPassword}
        onRegister={handleRegister}
        registerError={registerError}
        registerSuccess={registerSuccess}
      />
    );
  }

  // ==============================================
  // RENDER - DASHBOARD (Authenticated)
  // ==============================================

  return (
    <div className="min-h-screen bg-[#f0f6f5]">
      {/* Dashboard Header */}
      <DashboardHeader
        username={auth?.user?.username || "Admin"}
        onRefresh={refreshData}
        onLogout={handleLogout}
        onReports={() => setShowReporting(true)}
        loading={loading}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Announcement Editor */}
        <div className="mb-8">
          <AnnouncementEditor
            token={auth?.token || ""}
            onUpdate={refreshData}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-6 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            {/* ============================================== */}
            {/* TABS NAVIGATION */}
            {/* ============================================== */}
            <div className="flex flex-wrap p-8 text-slate-950 gap-2 mt-8 mb-8 border-b border-teal-500/20">
              {TABS.map(({ key, label, icon: Icon }) => {
                const count =
                  key === "partnerships"
                    ? partnerships.length
                    : key === "applications"
                      ? applications.length
                      : null;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                      activeTab === key
                        ? "text-[#007aff] border-b-2 border-[#007aff] bg-blue-50 rounded-lg"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === key ? "text-[#007aff]" : "text-slate-500"
                      }`}
                    />
                    <span>{label}</span>
                    {count !== null && (
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                          activeTab === key
                            ? "bg-[#007aff] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ============================================== */}
            {/* OVERVIEW TAB CONTENT */}
            {/* ============================================== */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <StatsCards stats={stats} />

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentActivity
                    type="partnerships"
                    items={stats.recent.partnerships}
                    title="Recent Partnerships"
                    onViewAll={() => setActiveTab("partnerships")}
                  />
                  <RecentActivity
                    type="applications"
                    items={stats.recent.applications}
                    title="Recent Applications"
                    onViewAll={() => setActiveTab("applications")}
                  />
                </div>
              </div>
            )}

            {/* ============================================== */}
            {/* PARTNERSHIPS TAB CONTENT */}
            {/* ============================================== */}
            {activeTab === "partnerships" && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <DataTable
                  data={partnerships}
                  showRowNumbers={true}
                  showReply={true}
                  onReply={handleReply}
                  columns={[
                    { key: "company_name", label: "Company" },
                    { key: "contact_name", label: "Contact" },
                    { key: "email", label: "Email" },
                    {
                      key: "selected_services",
                      label: "Services",
                      render: (v) =>
                        v?.slice(0, 2).join(", ") +
                        (v?.length > 2 ? ` +${v.length - 2}` : ""),
                    },
                    {
                      key: "created_at",
                      label: "Date",
                      render: (v) => new Date(v).toLocaleDateString(),
                    },
                  ]}
                  searchFields={["company_name", "contact_name", "email"]}
                  searchPlaceholder="Search partnerships..."
                  onView={(item) => {
                    setSelectedItem(item);
                    setShowDetailModal(true);
                  }}
                  onDelete={handleDeletePartnership}
                  onRefresh={refreshData}
                  loading={loading}
                  emptyMessage="No partnerships found"
                />
              </div>
            )}

            {/* ============================================== */}
            {/* APPLICATIONS TAB CONTENT */}
            {/* ============================================== */}
            {activeTab === "applications" && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <DataTable
                  data={applications}
                  showRowNumbers={true}
                  showReply={true}
                  onReply={handleReply}
                  columns={[
                    { key: "full_name", label: "Name" },
                    { key: "email", label: "Email" },
                    {
                      key: "track_id",
                      label: "Track",
                      render: (v) => (
                        <span className="px-2 py-1 bg-teal-500/10 text-teal-700 rounded-full text-xs font-medium">
                          {v?.toUpperCase()}
                        </span>
                      ),
                    },
                    { key: "institution", label: "Institution" },
                    {
                      key: "created_at",
                      label: "Date",
                      render: (v) => new Date(v).toLocaleDateString(),
                    },
                  ]}
                  searchFields={["full_name", "email", "institution"]}
                  searchPlaceholder="Search applications..."
                  onView={(item) => {
                    setSelectedItem(item);
                    setShowDetailModal(true);
                  }}
                  onDelete={handleDeleteApplication}
                  onRefresh={refreshData}
                  loading={loading}
                  emptyMessage="No applications found"
                />
              </div>
            )}

            <ConfirmationModal
              isOpen={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false);
                setDeleteTargetId(null);
                setDeleteType(null);
              }}
              onConfirm={confirmDelete}
              title={
                deleteType === "partnership"
                  ? "Delete Partnership"
                  : "Delete Application"
              }
              message={
                deleteType === "partnership"
                  ? "Are you sure you want to delete this partnership? This action will remove all associated data and cannot be undone."
                  : "Are you sure you want to delete this application? This action will remove all associated data and cannot be undone."
              }
              confirmText={
                deleteType === "partnership"
                  ? "Delete Partnership"
                  : "Delete Application"
              }
              loading={isDeleting}
              danger={true}
            />
          </>
        )}
      </div>

      {/* ============================================== */}
      {/* REPLY MODAL */}
      {/* ============================================== */}
      {showReplyModal && replyRecipient && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => {
            setShowReplyModal(false);
            setReplyRecipient(null);
          }}
          recipient={replyRecipient}
          token={auth?.token}
          onSuccess={() => {
            console.log("Reply sent successfully");
          }}
        />
      )}

      {/* ============================================== */}
      {/* DETAIL MODAL */}
      {/* ============================================== */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {"company_name" in selectedItem
                  ? "Partnership Details"
                  : "Application Details"}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedItem(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {Object.entries(selectedItem).map(([key, value]) => {
                if (
                  key === "id" ||
                  key === "selected_services" ||
                  key === "created_at" ||
                  key === "updated_at"
                )
                  return null;
                return (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {key.replace(/_/g, " ")}
                    </label>
                    <p className="text-slate-900 font-medium">
                      {Array.isArray(value)
                        ? value.join(", ")
                        : value || "Not specified"}
                    </p>
                  </div>
                );
              })}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Submitted
                </label>
                <p className="text-slate-700 text-sm">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 text-slate-950 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* REPORTING PANEL */}
      {/* ============================================== */}
      {showReporting && (
        <ReportingPanel
          data={{ partnerships, applications }}
          onClose={() => setShowReporting(false)}
          token={auth?.token}
          onRefresh={refreshData}
          isLoading={loading}
          adminEmail={auth?.user?.email || "hakuzwisilas@gmail.com"}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
