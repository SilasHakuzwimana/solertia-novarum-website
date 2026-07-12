import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public stats routes
router.get("/", StatsController.getStats);
router.get("/top-services", StatsController.getTopServices);
router.get("/track-distribution", StatsController.getTrackDistribution);
router.get("/education-distribution", StatsController.getEducationDistribution);
router.get("/date-range", StatsController.getStatsByDateRange);

// Admin stats routes (require authentication)
router.get("/admin", requireAdmin, StatsController.adminGetStats);

export default router;
