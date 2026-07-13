// src/services/email.service.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const COMPANY_NAME = "Solertia Novarum Ltd";
const COMPANY_DOMAIN = "solertianovarum.com";
const SUPPORT_EMAIL = process.env.EMAIL_SUPPORT || `support@${COMPANY_DOMAIN}`;
const DASHBOARD_URL =
  process.env.ADMIN_DASHBOARD_URL || "http://localhost:3004/admin";
const LOGIN_URL = process.env.ADMIN_LOGIN_URL || `${DASHBOARD_URL}`;

// ============================================
// RESEND CONFIGURATION
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || `noreply@${COMPANY_DOMAIN}`;

// ============================================
// NODEMAILER (GMAIL) CONFIGURATION
// ============================================
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn(
    "[EmailService] EMAIL_USER / EMAIL_PASSWORD are not set. Gmail sending will fail until configured.",
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  // Add timeout settings
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const DEFAULT_FROM =
  process.env.EMAIL_FROM || `"${COMPANY_NAME}" <admin@${COMPANY_DOMAIN}>`;

const palette = {
  ink: "#0d2e29",
  deep: "#072421",
  accent: "#007aff",
  teal: "#0d9488",
  bg: "#eef2f1",
  card: "#ffffff",
  border: "#e2e8e6",
  muted: "#5b6b68",
  success: "#1b8a5a",
  successBg: "#e9f7f0",
  successBorder: "#1b8a5a",
  warn: "#b45309",
  warnBg: "#fef6ec",
  warnBorder: "#e3a04c",
};

function renderLayout(opts: {
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  preheader?: string;
}): string {
  const { eyebrow, heading, bodyHtml, preheader = "" } = opts;
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${heading}</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background: ${palette.bg};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: ${palette.ink};
  }
  a { color: ${palette.accent}; }
  .preheader {
    display: none;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    mso-hide: all;
  }
  .wrapper {
    width: 100%;
    padding: 32px 16px;
  }
  .container {
    max-width: 560px;
    margin: 0 auto;
    background: ${palette.card};
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid ${palette.border};
  }
  .header {
    background: linear-gradient(135deg, ${palette.deep} 0%, ${palette.ink} 55%, ${palette.teal} 130%);
    padding: 32px 36px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    color: #ffffff;
    font-weight: 700;
    font-size: 15px;
    font-family: Georgia, "Times New Roman", serif;
  }
  .brand-name {
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .eyebrow {
    color: rgba(255,255,255,0.65);
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin: 22px 0 6px;
  }
  .heading {
    color: #ffffff;
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }
  .content {
    padding: 36px;
  }
  .content p {
    line-height: 1.65;
    font-size: 15px;
    color: ${palette.ink};
    margin: 0 0 16px;
  }
  .muted {
    color: ${palette.muted};
    font-size: 13px;
  }
  .divider {
    border: none;
    border-top: 1px solid ${palette.border};
    margin: 28px 0;
  }
  .footer {
    padding: 24px 36px 32px;
    text-align: center;
    color: ${palette.muted};
    font-size: 12px;
    line-height: 1.7;
  }
  .footer a { color: ${palette.muted}; text-decoration: underline; }
  .button {
    display: inline-block;
    background: ${palette.accent};
    color: #ffffff !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 26px;
    border-radius: 8px;
  }
</style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">
          <span class="brand-name">${COMPANY_NAME}</span>
        </div>
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="heading">${heading}</h1>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>${COMPANY_NAME} &middot; Bugesera District, Rwanda</p>
        <p>Questions? Reach us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p>&copy; ${year} ${COMPANY_NAME}. All rights reserved. This is an automated message — please do not reply.</p>
      </div>
    </div>
  </body>
</html>`;
}

/** Shared OTP code block markup used by all three OTP email variants. */
function otpBlock(otp: string): string {
  return `
    <div style="background:${palette.successBg}; border:1px solid ${palette.border}; border-radius:10px; padding:20px; text-align:center; margin:24px 0;">
      <div style="font-family:'Courier New', monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:${palette.deep};">
        ${otp}
      </div>
    </div>`;
}

type OtpPurpose = "verification" | "login" | "password-reset";

export class EmailService {
  /**
   * Try sending via Gmail first, fallback to Resend if Gmail fails.
   * This ensures maximum deliverability.
   */
  private static async sendWithFallback(
    mailOptions: {
      to: string;
      subject: string;
      html: string;
      attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType: string;
      }>;
    },
    useResend: boolean = false,
  ): Promise<boolean> {
    // Try Gmail first (if not explicitly told to skip)
    if (!useResend && EMAIL_USER && EMAIL_PASSWORD) {
      try {
        console.log(`📧 Attempting to send via Gmail to: ${mailOptions.to}`);

        const result = await transporter.sendMail({
          from: DEFAULT_FROM,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          attachments: mailOptions.attachments,
        });

        console.log(`✅ Email sent via Gmail: ${result.messageId}`);
        return true;
      } catch (gmailError: any) {
        console.warn(
          `⚠️ Gmail failed (${gmailError.code || gmailError.message}), falling back to Resend...`,
        );

        // Check if Resend API key is available
        if (!process.env.RESEND_API_KEY) {
          console.error("❌ Resend API key not configured. Email not sent.");
          return false;
        }
      }
    }

    // Try Resend as fallback
    try {
      console.log(`📧 Attempting to send via Resend to: ${mailOptions.to}`);

      const fromAddress = process.env.RESEND_FROM_EMAIL || FROM_EMAIL;
      const result = await resend.emails.send({
        from: `Solertia Novarum <${fromAddress}>`,
        to: [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        attachments: mailOptions.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      if (result.error) {
        console.error(`❌ Resend API error:`, result.error);
        return false;
      }

      console.log(`✅ Email sent via Resend: ${result.data.id}`);
      return true;
    } catch (resendError) {
      console.error(`❌ Both Gmail and Resend failed:`, resendError);
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 1. Registration Welcome Email
  // ---------------------------------------------------------------------
  static async sendWelcomeEmail(
    email: string,
    username: string,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Admin Dashboard",
        heading: `Welcome, ${username}`,
        preheader: "Your admin account is ready to go",
        bodyHtml: `
          <p>Hello ${username},</p>
          <p>Your admin account has been created for the ${COMPANY_NAME} admin dashboard. Here's what you can do once you're verified and signed in:</p>
          <div style="background:${palette.successBg}; border-left:3px solid ${palette.successBorder}; border-radius:8px; padding:18px 20px; margin:24px 0;">
            <ul style="margin:0; padding-left:18px; color:${palette.success}; font-size:14px; line-height:1.9;">
              <li>View real-time analytics and statistics</li>
              <li>Manage partnership and program applications</li>
              <li>Update record statuses and add internal notes</li>
              <li>Track performance metrics over time</li>
            </ul>
          </div>
          <p style="text-align:center; margin:28px 0 8px;">
            <a href="${DASHBOARD_URL}" class="button">Go to dashboard</a>
          </p>
        `,
      });

      return await this.sendWithFallback({
        to: email,
        subject: `Welcome to the ${COMPANY_NAME} admin dashboard`,
        html,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 2. Email Verification OTP (post-registration)
  // ---------------------------------------------------------------------
  static async sendVerificationOTP(
    email: string,
    otp: string,
    username: string,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Email Verification",
        heading: "Confirm your email address",
        preheader: `Your verification code is ${otp}`,
        bodyHtml: `
          <p>Hello ${username},</p>
          <p>Thanks for creating an account on the <strong>${COMPANY_NAME}</strong> admin dashboard. Enter the code below to confirm this is your email address:</p>
          ${otpBlock(otp)}
          <p class="muted">This code expires in 10 minutes. Until you verify, your account will have limited access.</p>
          <hr class="divider" />
          <p class="muted">Didn't create this account? You can ignore this email, or let us know at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
        `,
      });

      return await this.sendWithFallback({
        to: email,
        subject: `${otp} is your ${COMPANY_NAME} verification code`,
        html,
      });
    } catch (error) {
      console.error("Failed to send verification OTP email:", error);
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 3. Login OTP (2FA)
  // ---------------------------------------------------------------------
  static async sendLoginOTP(
    email: string,
    otp: string,
    username: string,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Sign-in Verification",
        heading: "Confirm it's you",
        preheader: `Your sign-in code is ${otp}`,
        bodyHtml: `
          <p>Hello ${username},</p>
          <p>We received a sign-in attempt on the <strong>${COMPANY_NAME}</strong> admin dashboard. Enter this code to complete your login:</p>
          ${otpBlock(otp)}
          <p class="muted">This code expires in 10 minutes. Our team will never call or email you asking for it.</p>
          <hr class="divider" />
          <p class="muted">Wasn't you? <br/>Change your password right away and contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
        `,
      });

      return await this.sendWithFallback({
        to: email,
        subject: `${otp} is your ${COMPANY_NAME} sign-in code`,
        html,
      });
    } catch (error) {
      console.error("Failed to send login OTP email:", error);
      return false;
    }
  }

  // -----------------------
  // 4. Password Reset OTP
  // -----------------------
  static async sendPasswordResetOTP(
    email: string,
    otp: string,
    username: string,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Account Security",
        heading: "Reset your password",
        preheader: `Your password reset code is ${otp}`,
        bodyHtml: `
          <p>Hello ${username},</p>
          <p>We received a request to reset the password on your <strong>${COMPANY_NAME}</strong> admin account. Use the code below to continue:</p>
          ${otpBlock(otp)}
          <div style="background:${palette.warnBg}; border-left:3px solid ${palette.warnBorder}; border-radius:8px; padding:14px 18px; margin:24px 0;">
            <p style="margin:0; color:${palette.warn}; font-size:13px;">This code expires in 10 minutes. If it expires, you'll need to request a new one.</p>
          </div>
          <hr class="divider" />
          <p class="muted">Didn't request this? Your password is still safe — just ignore this email, or reach out to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> if you're concerned.</p>
        `,
      });

      return await this.sendWithFallback({
        to: email,
        subject: `${otp} is your ${COMPANY_NAME} password reset code`,
        html,
      });
    } catch (error) {
      console.error("Failed to send password reset OTP email:", error);
      return false;
    }
  }

  /**
   * Backward-compatible generic OTP sender. Existing call sites
   * (e.g. OTPService.sendOTP()) can keep calling this without changes;
   * it just dispatches to the purpose-specific method above so each
   * OTP email keeps getting tailored subject/copy.
   */
  static async sendOTP(
    email: string,
    otp: string,
    username: string,
    purpose: OtpPurpose = "verification",
  ): Promise<boolean> {
    switch (purpose) {
      case "login":
        return this.sendLoginOTP(email, otp, username);
      case "password-reset":
        return this.sendPasswordResetOTP(email, otp, username);
      case "verification":
      default:
        return this.sendVerificationOTP(email, otp, username);
    }
  }

  // ---------------------------------
  // 5. Password Reset Confirmation
  // ----------------------------------
  static async sendPasswordResetConfirmation(
    email: string,
    username: string,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Account Security",
        heading: "Your password was changed",
        preheader: "Confirming a recent password reset on your account",
        bodyHtml: `
          <p>Hello ${username},</p>
          <p>This confirms that the password for your ${COMPANY_NAME} admin account was successfully changed.</p>
          <div style="background:${palette.successBg}; border-left:3px solid ${palette.successBorder}; border-radius:8px; padding:16px 20px; margin:24px 0;">
            <p style="margin:0; color:${palette.success}; font-weight:600; font-size:14px;">Password updated successfully.</p>
          </div>
          <p>If you made this change, no further action is needed.</p>
          <p class="muted">If you did not request this change, please contact us immediately at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> so we can secure your account.</p>
          <p style="text-align:center; margin:28px 0 8px;">
            <a href="${LOGIN_URL}" class="button">Go to login</a>
          </p>
        `,
      });

      return await this.sendWithFallback({
        to: email,
        subject: `Password reset confirmed — ${COMPANY_NAME}`,
        html,
      });
    } catch (error) {
      console.error("Failed to send password reset confirmation:", error);
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 6. Report Email (Admin -> external recipient, with attachments)
  // ---------------------------------------------------------------------
  static async sendReport(
    to: string,
    subject: string,
    message: string,
    attachments: Array<{
      filename: string;
      content: string | Buffer;
      contentType: string;
    }>,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Dashboard Report",
        heading: subject || "Your report is ready",
        preheader: "A new report has been generated from the admin dashboard",
        bodyHtml: `
          <p>Hello,</p>
          <p>A report has been generated from the ${COMPANY_NAME} admin dashboard.</p>
          <div style="background:#f8fafa; border-left:3px solid ${palette.accent}; border-radius:8px; padding:16px 20px; margin:24px 0;">
            <p style="margin:0; font-size:14px; color:${palette.ink};">${message || "Please find the attached report."}</p>
          </div>
          <p class="muted">${attachments.length} file${attachments.length === 1 ? "" : "s"} attached &middot; generated ${new Date().toLocaleString()}</p>
        `,
      });

      return await this.sendWithFallback({
        to,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      console.error("Failed to send report email:", error);
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 7. Reply Email (Admin -> partnership/application inquiry)
  // ---------------------------------------------------------------------
  static async sendReply(
    to: string,
    subject: string,
    htmlContent: string,
    includeAttachments: boolean = false,
  ): Promise<boolean> {
    try {
      const html = renderLayout({
        eyebrow: "Message from our team",
        heading: subject || `A reply from ${COMPANY_NAME}`,
        preheader: "You have a new reply regarding your inquiry",
        bodyHtml: `
          <div style="font-size:15px; line-height:1.65; color:${palette.ink};">
            ${htmlContent}
          </div>
        `,
      });

      return await this.sendWithFallback({
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Failed to send reply email:", error);
      return false;
    }
  }
}

export default EmailService;
