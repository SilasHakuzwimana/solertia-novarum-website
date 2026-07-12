import { Router } from "express";
import { PartnershipController } from "../controllers/partnership.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", PartnershipController.getAll);
router.get("/:id", PartnershipController.getOne);
router.post("/", PartnershipController.create);
router.delete("/:id", PartnershipController.delete);

// Admin routes
router.get("/admin/all", requireAdmin, PartnershipController.adminGetAll);
router.put("/admin/:id", requireAdmin, PartnershipController.adminUpdate);
router.delete("/admin/:id", requireAdmin, PartnershipController.adminDelete);

export default router;
