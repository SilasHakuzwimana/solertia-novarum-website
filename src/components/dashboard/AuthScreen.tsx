import React from "react";
import { Shield } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { OTPVerification } from "./OTPVerification";
import { ForgotPassword } from "./ForgotPassword";
import { ResetPassword } from "./ResetPassword";

type LoginStep = "login" | "otp" | "forgot-password" | "reset-password";

interface AuthScreenProps {
  step: LoginStep;
  loading: boolean;
  loginError: string;
  otpError: string;
  resetError: string;
  email: string;
  otpTimer: number;
  canResendOTP: boolean;
  resetSuccess: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onVerifyOTP: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onResetPassword: (
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  onBackToLogin: () => void;
  onGoToForgotPassword: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  step,
  loading,
  loginError,
  otpError,
  resetError,
  email,
  otpTimer,
  canResendOTP,
  resetSuccess,
  onLogin,
  onVerifyOTP,
  onResendOTP,
  onForgotPassword,
  onResetPassword,
  onBackToLogin,
  onGoToForgotPassword,
}) => {
  const getStepTitle = () => {
    switch (step) {
      case "login":
        return "Secure access with email & OTP verification";
      case "otp":
        return "Enter the OTP sent to your email";
      case "forgot-password":
        return "Reset your password";
      case "reset-password":
        return "Create new password";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#072421] via-[#0d2e29] to-[#123832] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-teal-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-[#007aff] to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-teal-200/70 text-sm mt-1">{getStepTitle()}</p>
        </div>

        {step === "login" && (
          <LoginForm
            onLogin={onLogin}
            onForgotPassword={onGoToForgotPassword}
            loading={loading}
            error={loginError}
          />
        )}

        {step === "otp" && (
          <OTPVerification
            email={email}
            otpTimer={otpTimer}
            canResendOTP={canResendOTP}
            loading={loading}
            error={otpError}
            onVerify={onVerifyOTP}
            onResend={onResendOTP}
            onBack={onBackToLogin}
          />
        )}

        {step === "forgot-password" && (
          <ForgotPassword
            loading={loading}
            error={resetError}
            onReset={onForgotPassword}
            onBack={onBackToLogin}
          />
        )}

        {step === "reset-password" && (
          <ResetPassword
            loading={loading}
            error={resetError}
            success={resetSuccess}
            onReset={onResetPassword}
            onBack={onBackToLogin}
          />
        )}
      </div>
    </div>
  );
};
