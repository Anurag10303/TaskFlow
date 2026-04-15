import { body, query, param, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

// Run validation and collect errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, "Validation failed", messages));
  }
  next();
};

// ── Auth validators ───────────────────────────────────────────
export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2–50 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Task validators ───────────────────────────────────────────
export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be 3–120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description max 1000 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "review", "done"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("tags").optional().isArray({ max: 5 }).withMessage("Max 5 tags"),
  body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
];

export const updateTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be 3–120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description max 1000 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "review", "done"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("tags").optional().isArray({ max: 5 }).withMessage("Max 5 tags"),
  body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
];

export const taskQueryValidator = [
  query("status")
    .optional()
    .isIn(["todo", "in-progress", "review", "done"])
    .withMessage("Invalid status filter"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority filter"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be 1–100"),
];
