// src/components/dashboard/ForgotPassword.tsx
import React, { useState } from "react";
import { AlertTriangle, Check, Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "../../api/client";
import { ForgotPasswordProps } from "@/src/types";

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  loading: externalLoading,
  error: externalError,
  onReset,
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      await onReset(email);
      setSuccess(true);
      setSuccessMessage("Password reset OTP has been sent to your email.");
    } catch (err: any) {
      setLocalError(err.message || "Failed to send reset email");
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setLocalError("");

    try {
      const storedEmail = localStorage.getItem("resetEmail") || email;

      const response = await apiClient.fetchWithTimeout(
        "/api/auth/resend-otp",
        {
          method: "POST",
          body: JSON.stringify({ email: storedEmail }),
        },
      );

      const responseData = response.data as any;

      if (response.status === 200 && responseData?.success) {
        setSuccessMessage("A new OTP has been sent to your email.");
        setSuccess(true);
        if (responseData?.loginToken) {
          localStorage.setItem("resetToken", responseData.loginToken);
        }
      } else {
        setLocalError(responseData?.error || "Failed to resend OTP");
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const displayError = localError || externalError;

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">OTP Sent Successfully!</p>
            <p className="text-xs opacity-80 mt-1">{successMessage}</p>
            <p className="text-xs opacity-60 mt-2">
              Please check your email for the 6-digit OTP code. The code will
              expire in 10 minutes.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="flex-1 bg-[#007aff] hover:bg-[#0055b3] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Resend OTP"
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={`w-full px-4 py-3 bg-white/5 border ${
            emailError ? "border-red-500" : "border-teal-500/30"
          } rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors`}
          placeholder="admin@example.com"
          required
          autoFocus
          disabled={externalLoading}
        />
        {emailError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {emailError}
          </p>
        )}
        <p className="text-xs text-teal-200/40 mt-1">
          Enter the email address associated with your account
        </p>
      </div>

      {localStorage.getItem("lastResetEmail") && (
        <div className="text-xs text-teal-200/40">
          <p>
            Last used:{" "}
            <span className="text-teal-200/60">
              {localStorage.getItem("lastResetEmail")}
            </span>
          </p>
        </div>
      )}

      {displayError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p>{displayError}</p>
            {displayError.includes("not found") && (
              <p className="text-xs opacity-80 mt-1">
                Please make sure you're using the correct email address.
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={externalLoading || !email}
        className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {externalLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending OTP...
          </span>
        ) : (
          "Send Reset OTP"
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-teal-500/20"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-transparent text-teal-200/40">or</span>
        </div>
      </div>

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
