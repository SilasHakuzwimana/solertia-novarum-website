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

// Admin sessions
const adminSessions: Map<
  string,
  { userId: number; username: string; email: string; expires: Date }
> = new Map();

export class AuthController {
  // Register new admin user
  static async register(req: Request, res: Response) {
    try {
      const { username, full_name, email, password, confirmPassword } =
        req.body;
      const finalUsername = username || full_name;

      // Validate input
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "All fields are required",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "Passwords do not match",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long",
        });
      }

      // Check if user already exists
      let userExists = false;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM admin_users WHERE email = $1 OR username = $2",
          [email, finalUsername],
        );
        userExists = result.rows.length > 0;
      } else {
        userExists = inMemoryAdminUsers.some(
          (u) => u.email === email || u.username === username,
        );
      }

      if (userExists) {
        return res.status(400).json({
          success: false,
          error: "User with this email or username already exists",
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      let newUser = null;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          `INSERT INTO admin_users (username, email, password_hash, is_verified, is_active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, username, email, is_verified, created_at`,
          [finalUsername, email, passwordHash, false, true],
        );
        newUser = result.rows[0];
      } else {
        // In-memory fallback
        const user = {
          id: inMemoryAdminUsers.length + 1,
          finalUsername,
          email,
          password: password, // Store plain text in development
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const otp = OTPService.generateOTP();
        inMemoryOTPs.set(email, {
          otp,
          expires: new Date(Date.now() + 10 * 60 * 1000),
        }); // 10 minutes
        inMemoryAdminUsers.push(user);
        newUser = user;
      }

      // Send welcome email
      await EmailService.sendWelcomeEmail(email, finalUsername);

      // Send OTP for verification
      const otpResult = await OTPService.sendVerificationOTP(
        email,
        finalUsername,
      );

      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Please verify your email with the OTP sent.",
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          requiresVerification: true,
        },
        otpSent: otpResult.success,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        error: "Registration failed",
      });
    }
  }

  // Verify email with OTP
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: "Email and OTP are required",
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

      // Update user verification status
      if (isDatabaseConnected()) {
        const db = getDbPool();
        await db.query(
          "UPDATE admin_users SET is_verified = true WHERE email = $1",
          [email],
        );
      } else {
        const user = inMemoryAdminUsers.find((u) => u.email === email);
        if (user) {
          user.is_verified = true;
        }
      }

      return res.json({
        success: true,
        message: "Email verified successfully! You can now login.",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        success: false,
        error: "Email verification failed",
      });
    }
  }

  // Resend verification OTP
  static async resendVerificationOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      // Get user data
      let user = null;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT username FROM admin_users WHERE email = $1 AND is_verified = false",
          [email],
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } else {
        user = inMemoryAdminUsers.find(
          (u) => u.email === email && !u.is_verified,
        );
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found or already verified",
        });
      }

      // Send new OTP
      const otpResult = await OTPService.sendVerificationOTP(
        email,
        user.username,
      );

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: otpResult.message,
        });
      }

      return res.json({
        success: true,
        message: "New verification OTP sent to your email",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to resend OTP",
      });
    }
  }

  // Admin Login with Email & Password + OTP
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Find user
      let user = null;
      let userFound = false;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM admin_users WHERE email = $1 AND is_active = true",
          [email],
        );

        if (result.rows.length > 0) {
          user = result.rows[0];
          userFound = true;

          // Verify password
          const validPassword = await bcrypt.compare(
            password,
            user.password_hash,
          );
          if (!validPassword) {
            return res.status(401).json({
              success: false,
              error: "Invalid credentials",
            });
          }
        }
      } else {
        // Development fallback
        user = inMemoryAdminUsers.find((u) => u.email === email);
        if (user) {
          userFound = true;
          if (password !== user.password) {
            return res.status(401).json({
              success: false,
              error: "Invalid credentials",
            });
          }
        }
      }

      if (!userFound) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Check if user is verified
      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          error: "Account not verified. Please verify your email first.",
          requiresVerification: true,
          email: email,
        });
      }

      // Generate and send OTP for login
      const otpResult = await OTPService.sendLoginOTP(email, user.username);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: "Failed to send OTP. Please try again.",
        });
      }

      // Generate login token (valid for 10 minutes)
      const loginToken = Buffer.from(`${email}-${Date.now()}`).toString(
        "base64",
      );

      return res.json({
        success: true,
        message: "OTP sent to your email",
        requiresOTP: true,
        loginToken,
        email: email,
        userId: user.id,
        expiresIn: 600, // 10 minutes in seconds
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        error: "Login failed",
      });
    }
  }

  // Verify OTP for login
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp, loginToken } = req.body;

      if (!email || !otp || !loginToken) {
        return res.status(400).json({
          success: false,
          error: "Email, OTP, and login token are required",
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

      // Get user data
      let userData = null;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT id, username, email, is_verified FROM admin_users WHERE email = $1",
          [email],
        );
        if (result.rows.length > 0) {
          userData = result.rows[0];
          // Update last login
          await db.query(
            "UPDATE admin_users SET last_login = NOW() WHERE id = $1",
            [userData.id],
          );
        }
      } else {
        userData = inMemoryAdminUsers.find((u) => u.email === email);
      }

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Generate session token
      const sessionToken = Buffer.from(
        `${userData.id}-${email}-${Date.now()}`,
      ).toString("base64");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store session
      adminSessions.set(sessionToken, {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        expires,
      });

      return res.json({
        success: true,
        token: sessionToken,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: "admin",
        },
        message: "Login successful",
        expires: expires.toISOString(),
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      return res.status(500).json({
        success: false,
        error: "OTP verification failed",
      });
    }
  }

  // Resend login OTP
  static async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      // Get user data
      let username = "";

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT username FROM admin_users WHERE email = $1 AND is_active = true",
          [email],
        );
        if (result.rows.length > 0) {
          username = result.rows[0].username;
        }
      } else {
        const user = inMemoryAdminUsers.find(
          (u) => u.email === email && u.is_active,
        );
        if (user) {
          username = user.username;
        }
      }

      if (!username) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Send new OTP
      const otpResult = await OTPService.sendLoginOTP(email, username);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: otpResult.message,
        });
      }

      // Generate new login token
      const loginToken = Buffer.from(`${email}-${Date.now()}`).toString(
        "base64",
      );

      return res.json({
        success: true,
        message: "New OTP sent to your email",
        loginToken,
        expiresIn: 600,
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to resend OTP",
      });
    }
  }

  // Admin Logout
  static logout(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      adminSessions.delete(token);
    }
    res.json({ success: true, message: "Logged out successfully" });
  }

  // Check Session
  static checkSession(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No session found" });
    }

    const session = adminSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (new Date() > session.expires) {
      adminSessions.delete(token);
      return res.status(401).json({ error: "Session expired" });
    }

    res.json({
      success: true,
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        role: "admin",
      },
      expires: session.expires,
    });
  }

  // Get session store (for middleware)
  static getSessionStore() {
    return adminSessions;
  }
}

export default AuthController;
