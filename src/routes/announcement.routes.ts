// src/routes/announcement.routes.ts
import { Router } from "express";
import announcementController from "../controllers/announcement.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   GET /api/announcements/active
 * @desc    Get active announcement (public)
 * @access  Public
 */
router.get("/active", announcementController.getActive);

/**
 * @route   GET /api/announcements
 * @desc    Get all announcements (admin only)
 * @access  Private (Admin)
 */
router.get("/", requireAdmin, announcementController.getAll);

/**
 * @route   POST /api/announcements
 * @desc    Create or update announcement (admin only)
 * @access  Private (Admin)
 */
router.post("/", requireAdmin, announcementController.upsert);

/**
 * @route   DELETE /api/announcements
 * @desc    Delete active announcement (admin only)
 * @access  Private (Admin)
 */
router.delete("/", requireAdmin, announcementController.delete);

export default router;
