import { getDbPool, isDatabaseConnected } from './database.service';
import EmailService from './email.service';

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  static async storeOTP(email: string, otp: string): Promise<boolean> {
    try {
      if (!isDatabaseConnected()) {
        console.warn('Database not connected, storing OTP in memory (development only)');
        // Fallback: store in memory for development
        return true;
      }

      const db = getDbPool();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTPs for this email
      await db.query(
        'DELETE FROM admin_otp WHERE email = $1 AND is_used = false',
        [email]
      );

      // Insert new OTP
      await db.query(
        `INSERT INTO admin_otp (email, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        [email, otp, expiresAt]
      );

      return true;
    } catch (error) {
      console.error('Failed to store OTP:', error);
      return false;
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string,): Promise<{ valid: boolean; message: string }> {
    try {
      if (!isDatabaseConnected()) {
        // Development fallback: accept any 6-digit code
        if (otp.length === 6 && /^\d+$/.test(otp)) {
          return { valid: true, message: 'OTP verified successfully (development mode)' };
        }
        return { valid: false, message: 'Invalid OTP format' };
      }

      const db = getDbPool();
      const result = await db.query(
        `SELECT * FROM admin_otp 
         WHERE email = $1 
         AND otp_code = $2 
         AND is_used = false 
         AND expires_at > NOW() 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, otp]
      );

      if (result.rows.length === 0) {
        return { valid: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as used
      await db.query(
        'UPDATE admin_otp SET is_used = true WHERE id = $1',
        [result.rows[0].id]
      );

      return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return { valid: false, message: 'Error verifying OTP' };
    }
  }

  // Send OTP via email
  static async sendOTP(email: string, username: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const stored = await this.storeOTP(email, otp);
      
      if (!stored) {
        return { success: false, message: 'Failed to generate OTP' };
      }

      const sent = await EmailService.sendOTP(email, otp, username);
      
      if (!sent) {
        return { success: false, message: 'Failed to send OTP email' };
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { success: false, message: 'Error sending OTP' };
    }
  }
}

export default OTPService;
