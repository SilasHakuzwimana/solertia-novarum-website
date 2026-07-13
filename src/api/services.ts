// src/api/services.ts - Fixed with proper type checking
import apiClient from "./client";
import {
  RegisterData,
  LoginData,
  RegisterResponse,
  LoginResponse,
  PartnershipRequest,
  InternshipApplication,
} from "../types";

// Centralized API service
export class APIService {
  // Register method
  static async register(data: any): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: data.username || data.full_name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword || data.confirm_password,
        }),
      });

      if (
        response.status === 201 &&
        response.data &&
        (response.data as any)?.success
      ) {
        const responseData = response.data as any;
        return {
          success: true,
          data: responseData.data,
          message: responseData.message || "Registration successful",
        };
      }

      if (response.status === 400) {
        const errorMsg =
          response.data && (response.data as any)?.error
            ? (response.data as any).error
            : "All fields are required. Please check your input.";
        return {
          success: false,
          error: errorMsg,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          error: "An account with this email already exists. Please login.",
        };
      }

      return {
        success: false,
        error: response.error || "Registration failed",
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Network error. Please try again.",
      };
    }
  }

  // Login user
  static async login(data: LoginData): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      return {
        status: response.status,
        data: response.data || {},
        error: response.error,
        success: response.success || false,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        status: 500,
        data: {
          success: false,
          error: error.message || "Network error occurred",
        },
        error: error.message || "Network error occurred",
        success: false,
      };
    }
  }

  // Logout user
  static async logout(
    token: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return { success: true };
      }

      return {
        success: false,
        error: response.error || "Logout failed",
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: error.message || "Network error. Please try again.",
      };
    }
  }

  // Check session
  static async checkSession(
    token: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/auth/check-session",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ FIX: Check response.data and response.data.success
      if (
        response.status === 200 &&
        response.data &&
        (response.data as any)?.success
      ) {
        return {
          success: true,
          data: response.data,
        };
      }
      return {
        success: false,
        error: response.error || "Session expired",
      };
    } catch (error: any) {
      console.error("Session check error:", error);
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  // Partnerships
  static async createPartnership(data: PartnershipRequest) {
    try {
      const response = await apiClient.createPartnership(data);
      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getPartnerships() {
    try {
      const response = await apiClient.getPartnerships();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Applications
  static async createApplication(data: InternshipApplication) {
    try {
      const response = await apiClient.createApplication(data);
      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getApplications() {
    try {
      const response = await apiClient.getApplications();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Health Check
  static async checkHealth() {
    try {
      const response = await apiClient.healthCheck();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Batch Operations
  static async syncAllData() {
    try {
      const [partnerships, applications, health] = await Promise.all([
        this.getPartnerships(),
        this.getApplications(),
        this.checkHealth(),
      ]);

      return {
        success: true,
        data: {
          partnerships: partnerships.success ? partnerships.data : [],
          applications: applications.success ? applications.data : [],
          health: health.success ? health.data : null,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default APIService;
