import {
  getDbPool,
  isDatabaseConnected,
  inMemoryOTPs,
} from "./database.service";
import EmailService from "./email.service";

export type OTPType =
  | "verification"
  | "login"
  | "password_reset"
  | "email_change";

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  static async storeOTP(
    email: string,
    otp: string,
    type: OTPType = "login",
  ): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      if (!isDatabaseConnected()) {
        // In-memory fallback for development
        if (!inMemoryOTPs.has(email)) {
          inMemoryOTPs.set(email, { otp, expires: expiresAt, type });
        }
        console.warn(
          "Database not connected, storing OTP in memory (development only)",
        );
        return true;
      }

      const db = getDbPool();

      // Delete any existing unused OTPs for this email
      await db.query(
        "DELETE FROM admin_otp WHERE email = $1 AND is_used = false",
        [email],
      );

      // Insert new OTP
      await db.query(
        `INSERT INTO admin_otp (email, otp_code, expires_at, type)
         VALUES ($1, $2, $3, $4)`,
        [email, otp, expiresAt, type],
      );

      return true;
    } catch (error) {
      console.error("Failed to store OTP:", error);
      return false;
    }
  }

  // Verify OTP
  static async verifyOTP(
    email: string,
    otp: string,
    type?: OTPType,
  ): Promise<{ valid: boolean; message: string }> {
    try {
      if (!isDatabaseConnected()) {
        // Development fallback: accept any 6-digit code
        if (otp.length === 6 && /^\d+$/.test(otp)) {
          // Check in-memory storage
          const stored = inMemoryOTPs.get(email);
          if (stored && stored.otp === otp) {
            if (new Date() > stored.expires) {
              inMemoryOTPs.delete(email);
              return { valid: false, message: "OTP has expired" };
            }
            if (type && stored.type !== type) {
              return {
                valid: false,
                message: `Invalid OTP type. Expected: ${type}`,
              };
            }
            inMemoryOTPs.delete(email);
            return { valid: true, message: "OTP verified successfully" };
          }
          return { valid: false, message: "Invalid OTP" };
        }
        return { valid: false, message: "Invalid OTP format" };
      }

      const db = getDbPool();

      // Build query with optional type filter
      let query = `
        SELECT * FROM admin_otp 
        WHERE email = $1 
        AND otp_code = $2 
        AND is_used = false 
        AND expires_at > NOW() 
      `;
      const params: any[] = [email, otp];

      if (type) {
        query += ` AND type = $3`;
        params.push(type);
      }

      query += ` ORDER BY created_at DESC LIMIT 1`;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return {
          valid: false,
          message: type
            ? `Invalid or expired ${type.replace("_", " ")} OTP`
            : "Invalid or expired OTP",
        };
      }

      // Mark OTP as used
      await db.query("UPDATE admin_otp SET is_used = true WHERE id = $1", [
        result.rows[0].id,
      ]);

      return { valid: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return { valid: false, message: "Error verifying OTP" };
    }
  }

  // ============================================
  // SEND OTP BY TYPE
  // ============================================

  // 1. Email Verification OTP (for registration)
  static async sendVerificationOTP(
    email: string,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const stored = await this.storeOTP(email, otp, "verification");

      if (!stored) {
        return { success: false, message: "Failed to generate OTP" };
      }

      const sent = await EmailService.sendVerificationOTP(email, otp, username);

      if (!sent) {
        return { success: false, message: "Failed to send verification email" };
      }

      return { success: true, message: "Verification OTP sent successfully" };
    } catch (error) {
      console.error("Failed to send verification OTP:", error);
      return { success: false, message: "Error sending verification OTP" };
    }
  }

  // 2. Login OTP (for 2FA)
  static async sendLoginOTP(
    email: string,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const stored = await this.storeOTP(email, otp, "login");

      if (!stored) {
        return { success: false, message: "Failed to generate OTP" };
      }

      const sent = await EmailService.sendLoginOTP(email, otp, username);

      if (!sent) {
        return { success: false, message: "Failed to send login OTP" };
      }

      return { success: true, message: "Login OTP sent successfully" };
    } catch (error) {
      console.error("Failed to send login OTP:", error);
      return { success: false, message: "Error sending login OTP" };
    }
  }

  // 3. Password Reset OTP
  static async sendPasswordResetOTP(
    email: string,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const stored = await this.storeOTP(email, otp, "password_reset");

      if (!stored) {
        return { success: false, message: "Failed to generate OTP" };
      }

      const sent = await EmailService.sendPasswordResetOTP(
        email,
        otp,
        username,
      );

      if (!sent) {
        return { success: false, message: "Failed to send password reset OTP" };
      }

      return { success: true, message: "Password reset OTP sent successfully" };
    } catch (error) {
      console.error("Failed to send password reset OTP:", error);
      return { success: false, message: "Error sending password reset OTP" };
    }
  }

  // 4. Legacy/Generic OTP (backward compatibility)
  static async sendOTP(
    email: string,
    username: string,
    type: OTPType = "login",
  ): Promise<{ success: boolean; message: string }> {
    switch (type) {
      case "verification":
        return this.sendVerificationOTP(email, username);
      case "password_reset":
        return this.sendPasswordResetOTP(email, username);
      case "login":
      default:
        return this.sendLoginOTP(email, username);
    }
  }

  // ============================================
  // CLEANUP EXPIRED OTPS
  // ============================================

  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      if (!isDatabaseConnected()) {
        // Clean in-memory
        const now = new Date();
        for (const [email, data] of inMemoryOTPs.entries()) {
          if (data.expires < now) {
            inMemoryOTPs.delete(email);
          }
        }
        return;
      }

      const db = getDbPool();
      await db.query(
        "DELETE FROM admin_otp WHERE expires_at <= NOW() OR is_used = true",
      );
    } catch (error) {
      console.error("Failed to cleanup expired OTPs:", error);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => OTPService.cleanupExpiredOTPs(), 5 * 60 * 1000);

export default OTPService;
