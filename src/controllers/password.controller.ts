import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  getDbPool,
  isDatabaseConnected,
  inMemoryAdminUsers,
  inMemoryOTPs,
} from "../services/database.service";
import OTPService from "../services/otp.service";
import EmailService from "../services/email.service";
import crypto from "crypto";

// In-memory store for reset tokens (in production)
const resetTokens = new Map<
  string,
  {
    email: string;
    expiresAt: number;
    token: string;
  }
>();

export class PasswordController {
  // Request password reset
  static async requestReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      // Find user
      let user = null;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM admin_users WHERE email = $1 AND is_active = true",
          [email],
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } else {
        user = inMemoryAdminUsers.find((u) => u.email === email && u.is_active);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Generate OTP for password reset
      const otpResult = await OTPService.sendOTP(email, user.username);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: "Failed to send OTP. Please try again.",
        });
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresIn = 600; // 10 minutes in seconds
      const expiresAt = Date.now() + expiresIn * 1000;

      // Store token with expiration
      resetTokens.set(resetToken, {
        email,
        expiresAt,
        token: resetToken,
      });

      // Clean up expired tokens periodically
      cleanupExpiredTokens();

      // Set secure HTTP-only cookie with the reset token
      res.cookie("resetToken", resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: expiresIn * 1000, // 10 minutes
        path: "/api/auth",
      });

      return res.json({
        success: true,
        message: "Password reset OTP sent to your email",
        resetToken, // For localStorage
        email,
        expiresIn,
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process password reset request",
      });
    }
  }

  // Verify OTP and reset password
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      // Get token from either cookie or request body
      const resetToken = req.cookies?.resetToken || req.body.resetToken;

      if (!email || !otp || !resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "All fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "Passwords do not match",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long",
        });
      }

      // Verify reset token
      const tokenData = resetTokens.get(resetToken);
      if (!tokenData) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired reset token",
        });
      }

      if (tokenData.email !== email) {
        return res.status(401).json({
          success: false,
          error: "Token does not match email",
        });
      }

      if (Date.now() > tokenData.expiresAt) {
        resetTokens.delete(resetToken);
        return res.status(401).json({
          success: false,
          error: "Reset token has expired. Please request a new one.",
        });
      }

      // Verify OTP
      const verification = await OTPService.verifyOTP(email, otp);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          error: verification.message,
        });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      let user = null;

      // Update password
      if (isDatabaseConnected()) {
        const db = getDbPool();
        await db.query(
          "UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2",
          [passwordHash, email],
        );
        const results = await db.query(
          "SELECT * FROM admin_users WHERE email = $1",
          [email],
        );
        user = results.rows[0];
      } else {
        user = inMemoryAdminUsers.find((u) => u.email === email);
        if (user) {
          user.password = newPassword;
        }
      }

      // Clear the used reset token
      resetTokens.delete(resetToken);

      // Clear the reset cookie
      res.clearCookie("resetToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth",
      });

      // Send confirmation email
      await EmailService.sendPasswordResetConfirmation(email, user.username);

      return res.json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reset password",
      });
    }
  }

  // Validate reset token
  static async validateResetToken(req: Request, res: Response) {
    try {
      const resetToken = req.query.token || req.cookies?.resetToken;

      if (!resetToken) {
        return res.status(400).json({
          success: false,
          error: "Reset token required",
          valid: false,
        });
      }

      const tokenData = resetTokens.get(resetToken as string);

      if (!tokenData) {
        console.log("❌ Token not found in store");
        return res.status(401).json({
          success: false,
          error: "Invalid reset token",
          valid: false,
        });
      }

      if (Date.now() > tokenData.expiresAt) {
        resetTokens.delete(resetToken as string);
        console.log("❌ Token expired");
        return res.status(401).json({
          success: false,
          error: "Reset token has expired",
          valid: false,
        });
      }

      return res.json({
        success: true,
        message: "Reset token is valid",
        valid: true,
        email: tokenData.email,
        expiresIn: Math.floor((tokenData.expiresAt - Date.now()) / 1000),
      });
    } catch (error) {
      console.error("Token validation error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to validate reset token",
        valid: false,
      });
    }
  }

  // Resend OTP with existing token
  static async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const resetToken = req.cookies?.resetToken || req.body.resetToken;

      if (!email || !resetToken) {
        return res.status(400).json({
          success: false,
          error: "Email and reset token are required",
        });
      }

      // Validate token
      const tokenData = resetTokens.get(resetToken);
      if (!tokenData || tokenData.email !== email) {
        return res.status(401).json({
          success: false,
          error: "Invalid reset token",
        });
      }

      if (Date.now() > tokenData.expiresAt) {
        resetTokens.delete(resetToken);
        return res.status(401).json({
          success: false,
          error: "Reset token has expired. Please request a new one.",
        });
      }

      // Find user
      let user = null;
      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM admin_users WHERE email = $1 AND is_active = true",
          [email],
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } else {
        user = inMemoryAdminUsers.find((u) => u.email === email && u.is_active);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Send new OTP
      const otpResult = await OTPService.sendPasswordResetOTP(
        email,
        user.username,
      );

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: "Failed to send OTP. Please try again.",
        });
      }

      return res.json({
        success: true,
        message: "New OTP sent to your email",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to resend OTP",
      });
    }
  }
}

// Helper function to clean up expired tokens
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

export default PasswordController;
