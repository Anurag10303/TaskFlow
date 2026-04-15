import express from "express";
import {
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/toggle-active", toggleUserActive);

export default router;
