// src/api/auth.service.ts
import apiClient from "./client";
import {
  RegisterData,
  LoginData,
  RegisterResponse,
  LoginResponse,
} from "../types";

export const AuthService = {
  // Register
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const payload = {
        username: data.username?.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirm_password || data.password,
      };

      const response = await apiClient.fetchWithTimeout<RegisterResponse>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      // Check if registration was successful
      if (response.status === 201 && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message:
            response.data.message ||
            "Registration successful! Please check your email for OTP.",
        };
      }

      // Handle specific error cases
      if (response.status === 400) {
        const errorMsg =
          response.data?.error ||
          "All fields are required. Please check your input.";
        console.error("❌ Registration failed (400):", errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          error:
            response.data?.error ||
            "An account with this email already exists. Please login.",
        };
      }

      return {
        success: false,
        error: response.data?.error || response.error || "Registration failed",
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }
  },

  async verifyEmail(email: string, otp: string): Promise<any> {
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

      return response;
    } catch (error: any) {
      console.error("Email verification error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },
  // Login - FIXED: Returns the raw response
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      // Return the FULL response object
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: "Network error occurred",
        },
        error: "Network error occurred",
      };
    }
  },

  // Verify OTP - FIXED: Returns the raw response
  async verifyOTP(
    email: string,
    otp: string,
    loginToken: string,
  ): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            loginToken,
          }),
        },
      );

      return response;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },

  // Resend OTP - FIXED: Returns the raw response
  async resendOTP(email: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/resend-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        },
      );
      return response;
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        },
      );
      return response;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },

  // Reset Password
  async resetPassword(
    email: string,
    otp: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            resetToken,
            newPassword,
            confirmPassword,
          }),
        },
      );
      return response;
    } catch (error: any) {
      console.error("Reset password error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },

  // Logout
  async logout(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },

  // Check Session
  async checkSession(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error: any) {
      console.error("Session check error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
      };
    }
  },
};

export default AuthService;
