import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import PasswordController from "../controllers/password.controller";
const router = Router();

// Public auth routes
router.post("/register", AuthController.register);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerificationOTP);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);
router.post("/logout", AuthController.logout);
router.get("/check", AuthController.checkSession);

export default router;

// Password reset routes
router.post("/forgot-password", PasswordController.requestReset);
router.post("/reset-password", PasswordController.resetPassword);
