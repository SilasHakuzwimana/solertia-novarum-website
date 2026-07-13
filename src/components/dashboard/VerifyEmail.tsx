// src/components/VerifyEmail.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { apiClient } from "../../api/client";

interface VerifyEmailProps {
  onVerificationComplete?: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  onVerificationComplete,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/verify-email",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          }),
        },
      );

      const responseData = response.data as any;

      if (response.status === 200 && responseData?.success) {
        setSuccess(
          responseData?.message ||
            "Email verified successfully! You can now login.",
        );
        setTimeout(() => {
          if (onVerificationComplete) {
            onVerificationComplete();
          }
          window.location.href = `/admin?email=${encodeURIComponent(email)}&verified=true`;
        }, 3000);
      } else if (response.status === 401) {
        setError(
          responseData?.error ||
            "Invalid or expired OTP. Please request a new one.",
        );
      } else {
        setError(
          responseData?.error || "Verification failed. Please try again.",
        );
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setResendLoading(true);
    setResendSuccess(null);
    setError(null);

    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/resend-verification-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        },
      );

      const responseData = response.data as any;

      if (response.status === 200 && responseData?.success) {
        setResendSuccess(
          responseData?.message || "New verification OTP sent to your email!",
        );
        setTimeout(() => setResendSuccess(null), 5000);
      } else {
        setError(responseData?.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#072421] via-[#0d2e29] to-[#123832] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-teal-500/30 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-[#007aff] to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="text-teal-200/70 text-sm mt-1">
            Enter the OTP sent to your email address
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verification Successful!</p>
              <p className="text-sm">{success}</p>
              <p className="text-xs text-green-300 mt-1">
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Success */}
        {resendSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-teal-200/80 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors"
                required
              />
            </div>
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-teal-200/80 mb-1">
              OTP Code *
            </label>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors text-center text-xl tracking-widest font-mono"
                maxLength={6}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="w-1 h-6 bg-teal-500/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-teal-300/60 mt-1">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-4">
          <button
            onClick={handleResendOTP}
            disabled={resendLoading || !email}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center border-t border-teal-500/20 pt-6">
          <Link
            to="/admin"
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
