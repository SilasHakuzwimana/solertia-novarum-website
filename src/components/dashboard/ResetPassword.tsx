import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { ResetPasswordProps } from "@/src/types";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      const resetToken = localStorage.getItem("resetToken");
      const resetEmail = localStorage.getItem("resetEmail");

      if (!resetToken || !resetEmail) {
        setIsTokenValid(false);
        setTokenLoading(false);
        return;
      }

      try {
        const response = await apiClient.fetchWithTimeout(
          `/api/auth/validate-token?token=${encodeURIComponent(resetToken)}`,
          {
            method: "GET",
          },
        );

        const responseData = response.data as any;

        if (response.status === 200 && responseData?.valid) {
          setIsTokenValid(true);
          if (responseData?.email) {
            setEmail(responseData.email);
          }
        } else {
          setIsTokenValid(false);
          localStorage.removeItem("resetToken");
          localStorage.removeItem("resetEmail");
          localStorage.removeItem("resetExpires");
        }
      } catch (err) {
        setIsTokenValid(false);
      } finally {
        setTokenLoading(false);
      }
    };

    validateToken();
  }, []);

  const validateOTP = (otpValue: string): boolean => {
    if (!otpValue) {
      setOtpError("OTP is required");
      return false;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError("OTP must be exactly 6 digits");
      return false;
    }
    setOtpError("");
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isOTPValid = validateOTP(otp);
    const isPasswordValid = validatePassword(newPassword);

    if (!isOTPValid || !isPasswordValid) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setLocalError("");
    await onReset(otp, newPassword, confirmPassword);
  };

  if (isTokenValid === false) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Invalid or expired reset token</p>
            <p className="text-xs opacity-80 mt-1">
              Please request a new password reset.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full bg-[#007aff] hover:bg-[#0055b3] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Request Reset
        </button>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Password Reset Successful!</p>
            <p className="text-xs opacity-80 mt-1">
              Your password has been reset successfully.
            </p>
            <p className="text-xs opacity-60 mt-2">
              You can now login with your new password.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full bg-[#007aff] hover:bg-[#0055b3] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-sm"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          OTP Code *
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit OTP"
          className={`w-full px-4 py-3 bg-white/5 border ${
            otpError ? "border-red-500" : "border-teal-500/30"
          } rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors text-center text-xl tracking-widest font-mono`}
          maxLength={6}
          required
        />
        {otpError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {otpError}
          </p>
        )}
        <p className="text-xs text-teal-200/40 mt-1">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          New Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 characters"
            className={`w-full px-4 py-3 bg-white/5 border ${
              passwordError ? "border-red-500" : "border-teal-500/30"
            } rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors pr-12`}
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {passwordError}
          </p>
        )}
        <ul className="text-xs text-teal-300/60 mt-2 space-y-0.5">
          <li className={newPassword.length >= 8 ? "text-green-400" : ""}>
            • At least 8 characters
          </li>
          <li className={/[A-Z]/.test(newPassword) ? "text-green-400" : ""}>
            • At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(newPassword) ? "text-green-400" : ""}>
            • At least one lowercase letter
          </li>
          <li className={/[0-9]/.test(newPassword) ? "text-green-400" : ""}>
            • At least one number
          </li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors pr-12"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-white transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {(error || localError) && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Resetting Password...
          </span>
        ) : (
          "Reset Password"
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center justify-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>
    </form>
  );
};
