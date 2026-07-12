import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", ApplicationController.getAll);
router.get("/:id", ApplicationController.getOne);
router.post("/", ApplicationController.create);
router.delete("/:id", ApplicationController.delete);

// Admin routes
router.get("/admin/all", requireAdmin, ApplicationController.adminGetAll);
router.put("/admin/:id", requireAdmin, ApplicationController.adminUpdate);
router.delete("/admin/:id", requireAdmin, ApplicationController.adminDelete);

export default router;
