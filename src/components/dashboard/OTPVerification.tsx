import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  otpTimer: number;
  canResendOTP: boolean;
  loading: boolean;
  error: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  otpTimer,
  canResendOTP,
  loading,
  error,
  onVerify,
  onResend,
  onBack,
}) => {
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otpCode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Enter OTP Code
        </label>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-[#007aff] transition-colors"
          placeholder="000000"
          maxLength={6}
          required
        />
        <p className="text-xs text-teal-300/60 mt-2 text-center">
          OTP sent to {email}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-teal-300/60">
        <span>
          {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')} remaining
        </span>
        {canResendOTP ? (
          <button
            type="button"
            onClick={onResend}
            className="text-[#007aff] hover:text-[#0055b3] font-medium"
          >
            Resend OTP
          </button>
        ) : (
          <span>Resend available in {otpTimer}s</span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || otpCode.length !== 6}
        className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-teal-400 hover:text-teal-300 transition-colors"
      >
        ← Back to Login
      </button>
    </form>
  );
};
