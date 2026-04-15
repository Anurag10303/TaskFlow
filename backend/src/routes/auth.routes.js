import express from "express";
import {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  registerValidator,
  loginValidator,
  validate,
} from "../validations/validators.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh", refreshTokens);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

export default router;
