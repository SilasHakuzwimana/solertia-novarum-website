import React, { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import axios from "axios";

interface ResetPasswordProps {
  loading: boolean;
  error: string;
  success: boolean;
  onReset: (
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  onBack: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  loading,
  error,
  success,
  onReset,
  onBack,
}) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      const resetToken = localStorage.getItem("resetToken");
      const email = localStorage.getItem("resetEmail");
      const expires = localStorage.getItem("resetExpires");

      if (!resetToken || !email) {
        setTokenValid(false);
        setTokenError(
          "No reset session found. Please request a new password reset.",
        );
        return;
      }

      if (expires && Date.now() > parseInt(expires)) {
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetExpires");
        setTokenValid(false);
        setTokenError(
          "Reset session expired. Please request a new password reset.",
        );
        return;
      }

      try {
        const response = await axios.get("/api/auth/validate-token", {
          params: { token: resetToken },
          withCredentials: true,
        });

        if (response.data.success) {
          setTokenValid(true);
          if (response.data.expiresIn) {
            localStorage.setItem(
              "resetExpires",
              String(Date.now() + response.data.expiresIn * 1000),
            );
          }
        } else {
          setTokenValid(false);
          setTokenError(
            "Invalid or expired reset token. Please request a new one.",
          );
          localStorage.removeItem("resetToken");
          localStorage.removeItem("resetEmail");
          localStorage.removeItem("resetExpires");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError("Failed to validate reset token. Please try again.");
      }
    };

    validateToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resetToken = localStorage.getItem("resetToken");
    const email = localStorage.getItem("resetEmail");

    if (!resetToken || !email) {
      setTokenError(
        "Reset session not found. Please request a new password reset.",
      );
      return;
    }

    await onReset(otp, newPassword, confirmPassword);
  };

  const handleResendOTP = async () => {
    try {
      const email = localStorage.getItem("resetEmail");
      const resetToken = localStorage.getItem("resetToken");

      if (!email || !resetToken) {
        setTokenError(
          "Reset session not found. Please request a new password reset.",
        );
        return;
      }

      const response = await axios.post(
        "/api/auth/resend-otp",
        { email, resetToken },
        { withCredentials: true },
      );

      if (response.data.success) {
        alert("New OTP sent to your email!");
      }
    } catch (err) {
      setTokenError("Failed to resend OTP. Please try again.");
    }
  };

  if (tokenValid === false) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{tokenError}</span>
        </div>
        <button
          onClick={onBack}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          Back to Request Reset
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
        <button
          onClick={onBack}
          className="w-full bg-[#007aff] hover:bg-[#0055b3] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localStorage.getItem("resetEmail") && (
        <div className="bg-white/5 border border-teal-500/30 rounded-lg px-4 py-2">
          <p className="text-sm text-teal-200/60">Resetting password for:</p>
          <p className="text-white font-medium">
            {localStorage.getItem("resetEmail")}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          OTP Code
        </label>
        <div className="relative">
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-[#007aff] transition-colors"
            placeholder="000000"
            maxLength={6}
            required
            autoFocus
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-xs text-[#007aff] hover:text-teal-400 transition-colors"
            >
              Resend
            </button>
          </div>
        </div>
        <p className="text-xs text-teal-200/40 mt-1">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors pr-12"
            placeholder="Min 8 characters"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="text-xs text-teal-200/40 mt-1">
          Password must be at least 8 characters long
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors"
          placeholder="Confirm new password"
          required
          minLength={8}
        />
      </div>

      {newPassword && newPassword.length >= 8 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-teal-200/60">Password strength</span>
            <span className="text-teal-200/80">
              {newPassword.length >= 12 &&
              /[A-Z]/.test(newPassword) &&
              /[0-9]/.test(newPassword)
                ? "Strong"
                : newPassword.length >= 10
                  ? "Medium"
                  : "Weak"}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                newPassword.length >= 12 &&
                /[A-Z]/.test(newPassword) &&
                /[0-9]/.test(newPassword)
                  ? "bg-green-500 w-full"
                  : newPassword.length >= 10
                    ? "bg-yellow-500 w-2/3"
                    : "bg-red-500 w-1/3"
              }`}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading || !otp || !newPassword || !confirmPassword}
          className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-teal-200/60 hover:text-teal-200 text-sm transition-colors"
        >
          Back to Request Reset
        </button>
      </div>
    </form>
  );
};
