import apiClient from './client';

export class AuthService {
  static async login(email: string, password: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async verifyOTP(email: string, otp: string, loginToken: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, loginToken }),
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async resendOTP(email: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async forgotPassword(email: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async resetPassword(
    email: string,
    otp: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          otp, 
          resetToken, 
          newPassword, 
          confirmPassword 
        }),
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async logout(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }

  static async checkSession(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout('/api/auth/check', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      return { status: 500, error: 'Network error occurred' };
    }
  }
}
