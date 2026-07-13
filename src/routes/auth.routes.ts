import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import PasswordController from "../controllers/password.controller";

const router = Router();

// ============================================
// PUBLIC AUTH ROUTES
// ============================================

// Auth routes
router.post("/register", AuthController.register);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerificationOTP);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);
router.post("/logout", AuthController.logout);
router.get("/check", AuthController.checkSession);

// ============================================
// PASSWORD RESET ROUTES
// ============================================

router.post("/forgot-password", PasswordController.requestReset);
router.post("/reset-password", PasswordController.resetPassword);
router.get("/validate-token", PasswordController.validateResetToken);
router.post("/resend-reset-otp", PasswordController.resendOTP);

export default router;
