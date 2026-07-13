// src/components/dashboard/LoginForm.tsx
import React, { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  User,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import { APIService } from "../../api/services";
import { RegisterData, LoginFormProps } from "../../types";

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onRegister,
  onForgotPassword,
  loading,
  error,
  registerError,
  registerSuccess,
  initialEmail = "",
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState(initialEmail);
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerData, setRegisterData] = useState<RegisterData>({
    full_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Update loginEmail when initialEmail changes (from verification redirect)
  useEffect(() => {
    if (initialEmail) {
      setLoginEmail(initialEmail);
      // Show a success message when returning from verification
      if (isRedirecting) {
        setLocalSuccess("Email verified successfully! Please login.");
        setIsRedirecting(false);
        setTimeout(() => setLocalSuccess(null), 5000);
      }
    }
  }, [initialEmail]);

  // Check if we're returning from verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get("verified");
    if (verified === "true") {
      setIsRedirecting(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allTouched: Record<string, boolean> = {};
    Object.keys(registerData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Check for errors
    const errors = Object.entries(registerData)
      .map(([key, value]) => {
        const error = validateField(key, value);
        return error ? { field: key, error } : null;
      })
      .filter(Boolean);

    if (errors.length > 0) {
      setLocalError(errors[0]?.error || "Please fix all errors");
      return;
    }

    setLocalLoading(true);
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const confirmPassword = registerData.confirm_password;
      const username = registerData.full_name;
      const result = await APIService.register({
        username: username,
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        confirmPassword: confirmPassword,
      });

      if (result.success) {
        setLocalSuccess(
          result.message ||
            "Registration successful! Please check your email for OTP.",
        );

        setTimeout(() => {
          // Store the email in session storage for return
          sessionStorage.setItem(
            "pendingVerificationEmail",
            registerData.email,
          );
          window.location.href = `/verify-email?email=${encodeURIComponent(registerData.email)}`;
        }, 2000);

        // Reset form
        setRegisterData({
          full_name: "",
          username: "",
          email: "",
          phone_number: "",
          password: "",
          confirm_password: "",
        });
        setTouched({});
      } else {
        setLocalError(result.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Network error. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev: any) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setLocalError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "full_name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return null;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return null;
      case "phone_number":
        if (
          value &&
          !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            value,
          )
        ) {
          return "Please enter a valid phone number";
        }
        return null;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value))
          return "Password must contain at least one number";
        return null;
      case "confirm_password":
        if (!value) return "Please confirm your password";
        if (value !== registerData.password) return "Passwords do not match";
        return null;
      default:
        return null;
    }
  };

  const getFieldError = (name: string): string | null => {
    if (!touched[name]) return null;
    return validateField(name, registerData[name as keyof RegisterData] || "");
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setTouched({});
    setLocalError(null);
    setLocalSuccess(null);
    // Clear registration data when switching modes
    if (!isRegistering) {
      setRegisterData({
        full_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
      });
    }
  };

  if (isRegistering) {
    return (
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        {(localSuccess || registerSuccess) && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>{localSuccess || registerSuccess}</span>
              <p className="text-xs text-green-300 mt-1">
                Redirecting to verification...
              </p>
            </div>
          </div>
        )}

        {(localError || registerError) && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || registerError}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-teal-200/80 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
            <input
              type="text"
              name="full_name"
              value={registerData.full_name}
              onChange={handleRegisterChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors ${
                getFieldError("full_name")
                  ? "border-red-500"
                  : "border-teal-500/30"
              }`}
              placeholder="John Doe"
              required
            />
          </div>
          {getFieldError("full_name") && (
            <p className="text-xs text-red-400 mt-1">
              {getFieldError("full_name")}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-teal-200/80 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors ${
                getFieldError("email") ? "border-red-500" : "border-teal-500/30"
              }`}
              placeholder="john@example.com"
              required
            />
          </div>
          {getFieldError("email") && (
            <p className="text-xs text-red-400 mt-1">
              {getFieldError("email")}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-teal-200/80 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
            <input
              type="tel"
              name="phone_number"
              value={registerData.phone_number}
              onChange={handleRegisterChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors ${
                getFieldError("phone_number")
                  ? "border-red-500"
                  : "border-teal-500/30"
              }`}
              placeholder="+250 78X XXX XXX"
            />
          </div>
          {getFieldError("phone_number") && (
            <p className="text-xs text-red-400 mt-1">
              {getFieldError("phone_number")}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-teal-200/80 mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors ${
                getFieldError("password")
                  ? "border-red-500"
                  : "border-teal-500/30"
              }`}
              placeholder="Min 8 characters"
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
          {getFieldError("password") && (
            <p className="text-xs text-red-400 mt-1">
              {getFieldError("password")}
            </p>
          )}
          <ul className="text-xs text-teal-300/60 mt-2 space-y-0.5">
            <li
              className={
                registerData.password.length >= 8 ? "text-green-400" : ""
              }
            >
              • At least 8 characters
            </li>
            <li
              className={
                /[A-Z]/.test(registerData.password) ? "text-green-400" : ""
              }
            >
              • At least one uppercase letter
            </li>
            <li
              className={
                /[a-z]/.test(registerData.password) ? "text-green-400" : ""
              }
            >
              • At least one lowercase letter
            </li>
            <li
              className={
                /[0-9]/.test(registerData.password) ? "text-green-400" : ""
              }
            >
              • At least one number
            </li>
          </ul>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-teal-200/80 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={registerData.confirm_password}
              onChange={handleRegisterChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors ${
                getFieldError("confirm_password")
                  ? "border-red-500"
                  : "border-teal-500/30"
              }`}
              placeholder="Confirm your password"
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
          {getFieldError("confirm_password") && (
            <p className="text-xs text-red-400 mt-1">
              {getFieldError("confirm_password")}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || localLoading}
          className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || localLoading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ✅ Show success message when returning from verification */}
      {localSuccess && !error && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{localSuccess}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors"
            placeholder="admin@solertianovarum.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors"
            placeholder="Enter your password"
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Forgot Password?
        </button>
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Create Account
        </button>
      </div>
    </form>
  );
};
